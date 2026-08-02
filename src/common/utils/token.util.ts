import crypto, { randomUUID } from "node:crypto";

import dayjs from "dayjs";
import jwt from "jsonwebtoken";

import { RefreshTokenModel } from "@/models";
import { config } from "@config";
import { ForbiddenError, UnauthorizedError } from "@errors";

export interface TokenPayload {
  userId: string;
  email: string;
  organizationId: string;
  sessionId?: string;
  familyId: string;
  jti: string;
  tokenVersion?: number;
  globalLogoutVersion?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  familyId: string;
  jti: string;
}

export interface TokenGenerationMeta {
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
  sessionId?: string;
}

export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const generateAuthTokens = (
  payloadInput: Omit<TokenPayload, "jti" | "familyId"> &
    Partial<Pick<TokenPayload, "jti" | "familyId">>
): AuthTokens => {
  const familyId = payloadInput.familyId ?? randomUUID();
  const jti = payloadInput.jti ?? randomUUID();

  const payload: TokenPayload = {
    ...payloadInput,
    familyId,
    jti,
  };

  const accessExpires = config.jwt.access.expiresIn;
  const refreshExpires = config.jwt.refresh.expiresIn;

  const accessToken = jwt.sign(
    payload,
    config.jwt.access.secret,
    accessExpires ? ({ expiresIn: accessExpires } as jwt.SignOptions) : {}
  );

  const refreshToken = jwt.sign(
    payload,
    config.jwt.refresh.secret,
    refreshExpires ? ({ expiresIn: refreshExpires } as jwt.SignOptions) : {}
  );

  return { accessToken, refreshToken, familyId, jti };
};

export const generateAndStoreTokens = async (
  payloadInput: Omit<TokenPayload, "jti" | "familyId"> &
    Partial<Pick<TokenPayload, "jti" | "familyId">>,
  meta?: TokenGenerationMeta,
  parentTokenHash?: string | null
): Promise<AuthTokens> => {
  const tokens = generateAuthTokens(payloadInput);
  const tokenHash = hashToken(tokens.refreshToken);

  const expiresAt = dayjs().add(30, "day").toDate();

  await RefreshTokenModel.create({
    user: payloadInput.userId,
    sessionId: meta?.sessionId ?? payloadInput.sessionId ?? null,
    familyId: tokens.familyId,
    jti: tokens.jti,
    tokenHash,
    parentTokenHash: parentTokenHash ?? null,
    deviceInfo: meta?.deviceInfo ?? null,
    ipAddress: meta?.ipAddress ?? null,
    userAgent: meta?.userAgent ?? null,
    status: "active",
    isRevoked: false,
    expiresAt,
  });

  return tokens;
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, config.jwt.access.secret) as TokenPayload;
  } catch {
    throw new UnauthorizedError("Invalid or expired access token");
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, config.jwt.refresh.secret) as TokenPayload;
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
};

/**
 * Enterprise Refresh Token Rotation (RTR) with Replay/Reuse Detection
 */
export const rotateRefreshToken = async (
  incomingRefreshToken: string,
  meta?: TokenGenerationMeta
): Promise<AuthTokens> => {
  // 1. Verify JWT signature & structure
  const decoded = verifyRefreshToken(incomingRefreshToken);
  const incomingHash = hashToken(incomingRefreshToken);

  // 2. Query token record in DB
  const tokenDoc = await RefreshTokenModel.findOne({ tokenHash: incomingHash });

  // 3. REUSE / REPLAY DETECTION
  if (!tokenDoc || tokenDoc.isRevoked || tokenDoc.status !== "active") {
    if (tokenDoc?.familyId || decoded.familyId) {
      const familyIdToRevoke = tokenDoc?.familyId ?? decoded.familyId;

      // Revoke ENTIRE Token Family immediately
      await RefreshTokenModel.updateMany(
        { familyId: familyIdToRevoke },
        {
          isRevoked: true,
          status: "revoked",
          revokedAt: new Date(),
          revokeReason: "REUSE_DETECTION_FAMILY_REVOKED",
        }
      );
    }

    throw new ForbiddenError(
      "Security Alert: Refresh token reuse detected. All active sessions have been revoked. Please log in again."
    );
  }

  // 4. Mark current token as used
  const now = new Date();
  tokenDoc.status = "used";
  tokenDoc.lastUsedAt = now;

  // 5. Generate replacement tokens with conditional optional fields
  const newTokens = generateAuthTokens({
    userId: decoded.userId,
    email: decoded.email,
    organizationId: decoded.organizationId,
    familyId: decoded.familyId,
    ...(decoded.sessionId ? { sessionId: decoded.sessionId } : {}),
    ...(decoded.tokenVersion !== undefined ? { tokenVersion: decoded.tokenVersion } : {}),
    ...(decoded.globalLogoutVersion !== undefined
      ? { globalLogoutVersion: decoded.globalLogoutVersion }
      : {}),
  });

  const newHash = hashToken(newTokens.refreshToken);
  tokenDoc.replacedByTokenHash = newHash;
  await tokenDoc.save();

  // 6. Store new Refresh Token in DB
  const expiresAt = dayjs().add(30, "day").toDate();

  await RefreshTokenModel.create({
    user: decoded.userId,
    sessionId: decoded.sessionId ?? meta?.sessionId ?? null,
    familyId: decoded.familyId,
    jti: newTokens.jti,
    tokenHash: newHash,
    parentTokenHash: incomingHash,
    deviceInfo: meta?.deviceInfo ?? tokenDoc.deviceInfo ?? null,
    ipAddress: meta?.ipAddress ?? tokenDoc.ipAddress ?? null,
    userAgent: meta?.userAgent ?? tokenDoc.userAgent ?? null,
    status: "active",
    isRevoked: false,
    expiresAt,
  });

  return newTokens;
};

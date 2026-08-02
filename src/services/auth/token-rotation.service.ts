import mongoose from "mongoose";

import { refreshTokenRepository } from "@/repositories";
import { ForbiddenError } from "@errors";
import { generateAuthTokens, hashToken, type AuthTokens, type TokenGenerationMeta } from "@utils";

import { jwtService } from "./jwt.service";
import { redisAuthService } from "./redis-auth.service";
import { reuseDetectionService } from "./reuse-detection.service";

export class TokenRotationService {
  public async rotate(
    incomingRefreshToken: string,
    meta?: TokenGenerationMeta
  ): Promise<AuthTokens> {
    const decoded = jwtService.verifyRefresh(incomingRefreshToken);
    const incomingHash = hashToken(incomingRefreshToken);

    // 2. Acquire Redis Distributed Lock to prevent duplicate concurrent refreshes
    const lockAcquired = await redisAuthService.acquireRefreshLock(decoded.jti, 10);
    if (!lockAcquired) {
      throw new ForbiddenError("Simultaneous refresh request in progress. Please retry.");
    }

    try {
      // 3. Query token record in DB
      const tokenDoc = await refreshTokenRepository.findByTokenHash(incomingHash);

      // 4. REUSE DETECTION TRIGGER
      if (!tokenDoc || tokenDoc.isRevoked || tokenDoc.status !== "active") {
        await reuseDetectionService.handleReuseDetected({
          familyId: tokenDoc?.familyId ?? decoded.familyId,
          ...(tokenDoc?.sessionId || decoded.sessionId
            ? { sessionId: tokenDoc?.sessionId ?? decoded.sessionId }
            : {}),
          userId: decoded.userId,
          ...(meta?.ipAddress ? { ipAddress: meta.ipAddress } : {}),
          ...(meta?.userAgent ? { userAgent: meta.userAgent } : {}),
        });
      }

      // 5. Generate NEW Token Pair
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

      // 6. Execute atomic update inside Mongoose Transaction
      const dbSession = await mongoose.startSession();
      await dbSession.withTransaction(async () => {
        // Mark old token as used
        await refreshTokenRepository.markAsUsed(incomingHash, newHash, dbSession);

        // Store new refresh token in DB
        await refreshTokenRepository.createToken(
          {
            user: new mongoose.Types.ObjectId(decoded.userId),
            sessionId: decoded.sessionId ?? meta?.sessionId ?? null,
            familyId: decoded.familyId,
            jti: newTokens.jti,
            tokenHash: newHash,
            parentTokenHash: incomingHash,
            deviceInfo: meta?.deviceInfo ?? tokenDoc?.deviceInfo ?? null,
            ipAddress: meta?.ipAddress ?? tokenDoc?.ipAddress ?? null,
            userAgent: meta?.userAgent ?? tokenDoc?.userAgent ?? null,
            status: "active",
            isRevoked: false,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          dbSession
        );
      });
      await dbSession.endSession();

      return newTokens;
    } finally {
      // 7. Release Redis Lock
      await redisAuthService.releaseRefreshLock(decoded.jti);
    }
  }
}

export const tokenRotationService = new TokenRotationService();

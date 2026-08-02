import type { Document, Types } from "mongoose";

export type RefreshTokenStatus = "active" | "used" | "revoked" | "expired";

export interface IRefreshToken extends Document {
  user: Types.ObjectId;
  sessionId?: string | null;
  familyId: string;
  jti: string;
  tokenHash: string;

  parentTokenHash?: string | null;
  replacedByTokenHash?: string | null;

  deviceInfo?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;

  status: RefreshTokenStatus;
  isRevoked: boolean;
  revokedAt?: Date | null;
  revokeReason?: string | null;

  lastUsedAt?: Date | null;
  expiresAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

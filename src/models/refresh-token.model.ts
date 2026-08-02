import { model, Schema } from "mongoose";

import { type IRefreshToken } from "@/types/refresh-token";

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    sessionId: {
      type: String,
      default: null,
      index: true,
    },

    familyId: {
      type: String,
      required: true,
      index: true,
    },

    jti: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    parentTokenHash: {
      type: String,
      default: null,
    },

    replacedByTokenHash: {
      type: String,
      default: null,
    },

    deviceInfo: {
      type: String,
      default: null,
    },

    ipAddress: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "used", "revoked", "expired"],
      default: "active",
      index: true,
    },

    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },

    revokedAt: {
      type: Date,
      default: null,
    },

    revokeReason: {
      type: String,
      default: null,
    },

    lastUsedAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

RefreshTokenSchema.index({ user: 1, familyId: 1, isRevoked: 1 });
RefreshTokenSchema.index({ familyId: 1, status: 1 });

export const RefreshTokenModel = model<IRefreshToken>("RefreshToken", RefreshTokenSchema);
export default RefreshTokenModel;

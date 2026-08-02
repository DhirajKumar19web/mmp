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

    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },

    deviceInfo: String,
    ipAddress: String,
    userAgent: String,

    isRevoked: {
      type: Boolean,
      default: false,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },

    replacedByTokenHash: String,
  },
  {
    timestamps: true,
  }
);

RefreshTokenSchema.index({ user: 1, isRevoked: 1 });

export const RefreshTokenModel = model<IRefreshToken>("RefreshToken", RefreshTokenSchema);
export default RefreshTokenModel;

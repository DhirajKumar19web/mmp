import { model, Schema, type Document, type Types } from "mongoose";

export interface IRefreshToken extends Document {
  user: Types.ObjectId;
  tokenHash: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
  isRevoked: boolean;
  expiresAt: Date;
  replacedByTokenHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

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

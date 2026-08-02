import { model, Schema } from "mongoose";

import { DeviceType, type ISession } from "@/types/session";

const SessionSchema = new Schema<ISession>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    refreshTokenHash: {
      type: String,
      required: true,
      select: false,
    },

    deviceName: {
      type: String,
      trim: true,
    },

    deviceType: {
      type: String,
      enum: Object.values(DeviceType),
      default: DeviceType.UNKNOWN,
    },

    ipAddress: {
      type: String,
      trim: true,
    },

    userAgent: {
      type: String,
      trim: true,
    },

    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
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

SessionSchema.index({ user: 1, isRevoked: 1, expiresAt: 1 });

export const SessionModel = model<ISession>("Session", SessionSchema);
export default SessionModel;

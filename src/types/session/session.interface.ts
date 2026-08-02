import type { DeviceType } from "@/types/session/session.types";
import type { Document, Types } from "mongoose";

export interface ISession extends Document {
  sessionId: string;
  user: Types.ObjectId;
  refreshTokenHash: string;

  deviceName?: string;
  deviceType: DeviceType;
  ipAddress?: string;
  userAgent?: string;

  isRevoked: boolean;
  lastActiveAt: Date;
  expiresAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

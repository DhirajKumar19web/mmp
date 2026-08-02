import type { Document, Types } from "mongoose";

export type AuditEventType =
  | "USER_LOGIN_SUCCESS"
  | "USER_LOGIN_FAILED"
  | "USER_LOGOUT"
  | "TOKEN_REFRESH_SUCCESS"
  | "TOKEN_REUSE_DETECTED"
  | "GLOBAL_LOGOUT"
  | "PASSWORD_CHANGE";

export interface IAuditLog extends Document {
  user?: Types.ObjectId | null;
  organization?: Types.ObjectId | null;
  event: AuditEventType;
  ipAddress?: string | null;
  userAgent?: string | null;
  deviceInfo?: string | null;
  details?: Record<string, unknown>;
  createdAt: Date;
}

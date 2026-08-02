import type { SessionLimitBehavior } from "@/types/login-policy/login-policy.types";
import type { Document, Types } from "mongoose";

export interface ILoginPolicy extends Document {
  organization: Types.ObjectId;

  // Concurrent Session Controls
  maxConcurrentSessions: number;
  sessionLimitBehavior: SessionLimitBehavior;

  // Account Lockout Policy
  maxFailedLoginAttempts: number;
  lockoutDurationMinutes: number;

  // Session & Token Lifespan
  accessTokenTtlMinutes: number;
  refreshTokenTtlDays: number;
  idleTimeoutMinutes?: number | null;

  // Security & MFA
  requireMfa: boolean;
  requirePasswordChangeOnFirstLogin: boolean;
  passwordExpireDays?: number | null;

  // IP & Location Restrictions
  ipWhitelistingEnabled: boolean;
  allowedIpRanges: string[];

  // Time Restrictions
  timeRestrictionEnabled: boolean;
  allowedDays: number[];
  allowedStartTime?: string | null;
  allowedEndTime?: string | null;

  isActive: boolean;
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}

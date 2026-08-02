import { model, Schema, type Document, type Types } from "mongoose";

export enum SessionLimitBehavior {
  LOGOUT_OLDEST = "LOGOUT_OLDEST",
  BLOCK_NEW_LOGIN = "BLOCK_NEW_LOGIN",
}

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

const LoginPolicySchema = new Schema<ILoginPolicy>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      unique: true,
      index: true,
    },

    // Concurrent Sessions
    maxConcurrentSessions: {
      type: Number,
      default: 5,
      min: 1,
    },

    sessionLimitBehavior: {
      type: String,
      enum: Object.values(SessionLimitBehavior),
      default: SessionLimitBehavior.LOGOUT_OLDEST,
    },

    // Account Lockout
    maxFailedLoginAttempts: {
      type: Number,
      default: 5,
      min: 1,
    },

    lockoutDurationMinutes: {
      type: Number,
      default: 15,
      min: 1,
    },

    // Lifespan & Timeouts
    accessTokenTtlMinutes: {
      type: Number,
      default: 15,
      min: 1,
    },

    refreshTokenTtlDays: {
      type: Number,
      default: 30,
      min: 1,
    },

    idleTimeoutMinutes: {
      type: Number,
      default: null,
    },

    // Security & MFA
    requireMfa: {
      type: Boolean,
      default: false,
    },

    requirePasswordChangeOnFirstLogin: {
      type: Boolean,
      default: false,
    },

    passwordExpireDays: {
      type: Number,
      default: null,
    },

    // IP Restrictions
    ipWhitelistingEnabled: {
      type: Boolean,
      default: false,
    },

    allowedIpRanges: [
      {
        type: String,
        trim: true,
      },
    ],

    // Time Restrictions
    timeRestrictionEnabled: {
      type: Boolean,
      default: false,
    },

    allowedDays: [
      {
        type: Number,
        min: 0,
        max: 6,
      },
    ],

    allowedStartTime: {
      type: String,
      trim: true,
      default: null,
    },

    allowedEndTime: {
      type: String,
      trim: true,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const LoginPolicyModel = model<ILoginPolicy>("LoginPolicy", LoginPolicySchema);
export default LoginPolicyModel;

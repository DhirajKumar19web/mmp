import { model, Schema } from "mongoose";

import { type IAuditLog } from "@/types/audit-log";

const AuditLogSchema = new Schema<IAuditLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
      index: true,
    },

    event: {
      type: String,
      required: true,
      index: true,
    },

    ipAddress: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
    },

    deviceInfo: {
      type: String,
      default: null,
    },

    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AuditLogSchema.index({ user: 1, createdAt: -1 });

export const AuditLogModel = model<IAuditLog>("AuditLog", AuditLogSchema);
export default AuditLogModel;

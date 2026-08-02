import { AuditLogModel } from "@/models";
import { logger } from "@config";

import type { AuditEventType } from "@/types/audit-log";

export interface AuditEventData {
  event: AuditEventType;
  userId?: string;
  organizationId?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
  details?: Record<string, unknown>;
}

export class AuditService {
  /**
   * Non-blocking Audit Logger (queues or logs asynchronously without blocking the HTTP pipeline)
   */
  public logEvent(data: AuditEventData): void {
    setImmediate(async () => {
      try {
        await AuditLogModel.create({
          ...(data.userId ? { user: data.userId } : {}),
          ...(data.organizationId ? { organization: data.organizationId } : {}),
          event: data.event,
          ...(data.ipAddress ? { ipAddress: data.ipAddress } : {}),
          ...(data.userAgent ? { userAgent: data.userAgent } : {}),
          ...(data.deviceInfo ? { deviceInfo: data.deviceInfo } : {}),
          ...(data.details ? { details: data.details } : {}),
        });
      } catch (error) {
        logger.error({ err: error, eventData: data }, "Failed to persist audit log entry");
      }
    });
  }
}

export const auditService = new AuditService();

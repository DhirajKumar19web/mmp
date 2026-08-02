import { logger } from "@config";

import type { Request } from "express";

export const SecurityLogger = {
  logBlockedRequest(req: Request, rateLimitType: string, reason: string): void {
    logger.warn({
      event: "SECURITY_RATE_LIMIT_BLOCKED",
      path: req.originalUrl,
      ip: req.ip,
      type: rateLimitType,
      reason,
      timestamp: new Date().toISOString(),
    });
  },
};

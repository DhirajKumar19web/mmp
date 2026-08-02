import { IDENTIFIER_TYPE } from "@constants/rate-limit.constants";

import type { Request } from "express";

export const ClientIdentifierResolver = {
  resolveIdentifier(req: Request, type: IDENTIFIER_TYPE): string {
    switch (type) {
      case IDENTIFIER_TYPE.EMAIL: {
        const body = req.body as Record<string, unknown> | undefined;
        const email = typeof body?.email === "string" ? body.email.toLowerCase().trim() : null;
        return email ?? req.ip ?? "unknown_ip";
      }
      case IDENTIFIER_TYPE.USER_ID: {
        const userReq = req as Request & { user?: { id?: string } };
        const userId = userReq.user?.id;
        return userId ?? req.ip ?? "unknown_ip";
      }
      case IDENTIFIER_TYPE.API_KEY: {
        const apiKey = req.headers["x-api-key"];
        return typeof apiKey === "string" ? apiKey : (req.ip ?? "unknown_ip");
      }
      case IDENTIFIER_TYPE.IP:
      default:
        return req.ip ?? req.socket.remoteAddress ?? "127.0.0.1";
    }
  },
};

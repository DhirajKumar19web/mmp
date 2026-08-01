import { randomUUID } from "node:crypto";

import pinoHttp from "pino-http";

import logger from "@/config/logger";

export const httpLogger = pinoHttp({
  logger,

  genReqId(req, res) {
    const id = req.headers["x-request-id"]?.toString() ?? randomUUID();

    res.setHeader("X-Request-Id", id);

    return id;
  },

  customLogLevel(_req, res, err) {
    if (err || res.statusCode >= 500) return "error";

    if (res.statusCode >= 400) return "warn";

    if (res.statusCode >= 300) return "silent";

    return "info";
  },

  customSuccessMessage(req, res) {
    const method = req.method ?? "UNKNOWN";
    const url = req.url ?? "";
    const statusCode = String(res.statusCode);
    return `${method} ${url} completed (${statusCode})`;
  },

  customErrorMessage(req, res, err) {
    const method = req.method ?? "UNKNOWN";
    const url = req.url ?? "";
    const statusCode = String(res.statusCode);
    return `${method} ${url} failed (${statusCode}) - ${err.message}`;
  },

  customProps(req) {
    return {
      ip: req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
    };
  },

  autoLogging: true,
});

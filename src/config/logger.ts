// src/config/logger.ts

import pino, { type LoggerOptions } from "pino";

import { config } from "@/config";

const isDevelopment = config.server.env === "development";

const loggerOptions: LoggerOptions = {
  name: config.logger.serviceName,

  level: config.logger.level,

  timestamp: pino.stdTimeFunctions.isoTime,

  base: {
    service: config.logger.serviceName,
    environment: config.server.env,
  },

  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.body.password",
      "req.body.confirmPassword",
      "req.body.currentPassword",
      "req.body.newPassword",
      "req.body.accessToken",
      "req.body.refreshToken",
      "req.body.token",
      "password",
      "accessToken",
      "refreshToken",
      "token",
      "*.password",
      "*.accessToken",
      "*.refreshToken",
      "*.token",
    ],
    censor: "[REDACTED]",
  },

  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
};

if (isDevelopment && config.logger.pretty) {
  loggerOptions.transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
      singleLine: false,
      messageFormat: "{msg}",
    },
  };
}

export const logger = pino(loggerOptions);

export default logger;

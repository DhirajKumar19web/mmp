import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Request, type Response } from "express";
import mongoose from "mongoose";

import { ApiResponse, errorHandler, HTTP_STATUS, ServiceUnavailableError } from "@common";
import { config } from "@config";
import { globalRateLimiter, urlSanitizer } from "@middlewares";
import { rootRouter } from "@routes";

const app = express();
app.set("trust proxy", config.server.trustProxy || 1);

app.use(
  cors({
    origin: config.security.corsOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Reusable URL Sanitizer Middleware (Trims accidental spaces & %20)
app.use(urlSanitizer);

// Global Rate Limiter for all API routes
app.use(globalRateLimiter);

// API Routes
app.use(`${config.server.api.prefix}/${config.server.api.version}`, rootRouter);

app.get("/health/live", (_req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success({
      statusCode: HTTP_STATUS.OK,
      message: "Liveness probe passed",
      data: {
        status: "UP",
        uptime: process.uptime(),
      },
    })
  );
});

app.get("/health/ready", (_req: Request, res: Response) => {
  const isDbConnected = mongoose.connection.readyState === mongoose.ConnectionStates.connected;

  if (isDbConnected) {
    res.status(HTTP_STATUS.OK).json(
      ApiResponse.success({
        statusCode: HTTP_STATUS.OK,
        message: "Readiness probe passed",
        data: {
          status: "READY",
          database: "CONNECTED",
        },
      })
    );
  } else {
    throw new ServiceUnavailableError("Database disconnected");
  }
});

app.use(errorHandler);

export { app };

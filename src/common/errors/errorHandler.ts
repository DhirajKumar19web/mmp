import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { ZodError } from "zod";

import { HTTP_STATUS } from "@common/constants";
import { AppError, TooManyRequestsError } from "@common/errors/AppError";

import type { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,

  _next: NextFunction
): void => {
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";
  let errorCode = "ERR_INTERNAL_SERVER";
  let errors: unknown[] = [];
  let retryAfter: number | undefined;

  if (err instanceof TooManyRequestsError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.errorCode ?? "ERR_TOO_MANY_REQUESTS";
    retryAfter = err.retryAfter;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.errorCode ?? "ERR_APPLICATION";
    errors = err.errors;
  } else if (err instanceof ZodError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = "Validation Failed";
    errorCode = "ERR_VALIDATION";
    errors = err.issues;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = err.message;
    errorCode = "ERR_DB_VALIDATION";
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = `Invalid field parameter: ${err.path}`;
    errorCode = "ERR_INVALID_PARAMETER";
  } else if (err instanceof jwt.JsonWebTokenError) {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = "Invalid Authentication Token";
    errorCode = "ERR_INVALID_TOKEN";
  } else if (err instanceof jwt.TokenExpiredError) {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = "Authentication Token Expired";
    errorCode = "ERR_TOKEN_EXPIRED";
  } else if (err instanceof Error) {
    message = err.message;
  }

  if (retryAfter !== undefined) {
    res.setHeader("Retry-After", retryAfter.toString());
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    errorCode,
    message,
    ...(retryAfter !== undefined && { retryAfter }),
    ...(errors.length > 0 && { errors }),
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    ...(process.env.NODE_ENV !== "production" &&
      err instanceof Error && {
        stack: err.stack,
      }),
  });
};

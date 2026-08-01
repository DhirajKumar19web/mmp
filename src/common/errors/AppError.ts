import { HTTP_STATUS } from "@common/constants/httpStatus";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly success: boolean = false;
  public readonly errors: unknown[];
  public readonly errorCode: string | undefined;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errorCode?: string,
    errors: unknown[] = [],
    isOperational = true,
    stack = ""
  ) {
    super(message);

    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", errorCode = "ERR_BAD_REQUEST", errors: unknown[] = []) {
    super(message, HTTP_STATUS.BAD_REQUEST, errorCode, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access", errorCode = "ERR_UNAUTHORIZED") {
    super(message, HTTP_STATUS.UNAUTHORIZED, errorCode);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden access", errorCode = "ERR_FORBIDDEN") {
    super(message, HTTP_STATUS.FORBIDDEN, errorCode);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", errorCode = "ERR_NOT_FOUND") {
    super(message, HTTP_STATUS.NOT_FOUND, errorCode);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict", errorCode = "ERR_CONFLICT") {
    super(message, HTTP_STATUS.CONFLICT, errorCode);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", errors: unknown[] = [], errorCode = "ERR_VALIDATION") {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, errorCode, errors);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = "Service unavailable", errorCode = "ERR_SERVICE_UNAVAILABLE") {
    super(message, HTTP_STATUS.SERVICE_UNAVAILABLE, errorCode);
  }
}

export class TooManyRequestsError extends AppError {
  public readonly retryAfter: number;

  constructor(
    message = "Too many requests. Try again later.",
    retryAfter = 60,
    errorCode = "ERR_TOO_MANY_REQUESTS"
  ) {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS, errorCode);
    this.retryAfter = retryAfter;
  }
}

export const ApiError = AppError;

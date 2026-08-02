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

export class PaymentRequiredError extends AppError {
  constructor(message = "Payment required", errorCode = "ERR_PAYMENT_REQUIRED") {
    super(message, HTTP_STATUS.PAYMENT_REQUIRED, errorCode);
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

export class MethodNotAllowedError extends AppError {
  constructor(message = "Method not allowed", errorCode = "ERR_METHOD_NOT_ALLOWED") {
    super(message, HTTP_STATUS.METHOD_NOT_ALLOWED, errorCode);
  }
}

export class NotAcceptableError extends AppError {
  constructor(message = "Not acceptable", errorCode = "ERR_NOT_ACCEPTABLE") {
    super(message, HTTP_STATUS.NOT_ACCEPTABLE, errorCode);
  }
}

export class RequestTimeoutError extends AppError {
  constructor(message = "Request timeout", errorCode = "ERR_REQUEST_TIMEOUT") {
    super(message, HTTP_STATUS.REQUEST_TIMEOUT, errorCode);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict", errorCode = "ERR_CONFLICT") {
    super(message, HTTP_STATUS.CONFLICT, errorCode);
  }
}

export class GoneError extends AppError {
  constructor(message = "Resource no longer available", errorCode = "ERR_GONE") {
    super(message, HTTP_STATUS.GONE, errorCode);
  }
}

export class PreconditionFailedError extends AppError {
  constructor(message = "Precondition failed", errorCode = "ERR_PRECONDITION_FAILED") {
    super(message, HTTP_STATUS.PRECONDITION_FAILED, errorCode);
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message = "Payload too large", errorCode = "ERR_PAYLOAD_TOO_LARGE") {
    super(message, HTTP_STATUS.PAYLOAD_TOO_LARGE, errorCode);
  }
}

export class UnsupportedMediaTypeError extends AppError {
  constructor(message = "Unsupported media type", errorCode = "ERR_UNSUPPORTED_MEDIA_TYPE") {
    super(message, HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE, errorCode);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", errors: unknown[] = [], errorCode = "ERR_VALIDATION") {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, errorCode, errors);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(
    message = "Unprocessable entity",
    errors: unknown[] = [],
    errorCode = "ERR_UNPROCESSABLE_ENTITY"
  ) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, errorCode, errors);
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

export class InternalServerError extends AppError {
  constructor(message = "Internal server error", errorCode = "ERR_INTERNAL_SERVER") {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, errorCode, [], false);
  }
}

export class NotImplementedError extends AppError {
  constructor(message = "Not implemented", errorCode = "ERR_NOT_IMPLEMENTED") {
    super(message, HTTP_STATUS.NOT_IMPLEMENTED, errorCode);
  }
}

export class BadGatewayError extends AppError {
  constructor(message = "Bad gateway", errorCode = "ERR_BAD_GATEWAY") {
    super(message, HTTP_STATUS.BAD_GATEWAY, errorCode);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = "Service unavailable", errorCode = "ERR_SERVICE_UNAVAILABLE") {
    super(message, HTTP_STATUS.SERVICE_UNAVAILABLE, errorCode);
  }
}

export class GatewayTimeoutError extends AppError {
  constructor(message = "Gateway timeout", errorCode = "ERR_GATEWAY_TIMEOUT") {
    super(message, HTTP_STATUS.GATEWAY_TIMEOUT, errorCode);
  }
}

export const ApiError = AppError;

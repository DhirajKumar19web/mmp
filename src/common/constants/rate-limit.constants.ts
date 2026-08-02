export enum RATE_LIMIT_STRATEGY {
  FIXED_WINDOW = "fixed-window",
  SLIDING_WINDOW = "sliding-window",
  TOKEN_BUCKET = "token-bucket",
  LEAKY_BUCKET = "leaky-bucket",
}

export enum IDENTIFIER_TYPE {
  IP = "ip",
  EMAIL = "email",
  USER_ID = "user_id",
  ORGANIZATION_ID = "organization_id",
  DEVICE_ID = "device_id",
  API_KEY = "api_key",
  SESSION_ID = "session_id",
}

export const RATE_LIMIT_HEADERS = {
  LIMIT: "X-RateLimit-Limit",
  REMAINING: "X-RateLimit-Remaining",
  RESET: "X-RateLimit-Reset",
  RETRY_AFTER: "Retry-After",
} as const;

export const REDIS_PREFIXES = {
  LIMIT: "limiter:",
  FAILED_ATTEMPTS: "failed_attempts:",
  ACCOUNT_LOCK: "account_lock:",
  OTP_ATTEMPTS: "otp_attempts:",
  OTP_LOCK: "otp_lock:",
  DEVICE_LIMIT: "device_limit:",
} as const;

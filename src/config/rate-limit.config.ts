import { IDENTIFIER_TYPE, RATE_LIMIT_STRATEGY } from "@common/constants/rate-limit.constants";

export interface RateLimitRuleConfig {
  type: string;
  algorithm: RATE_LIMIT_STRATEGY;
  limit: number;
  windowSeconds: number;
  identifierType: IDENTIFIER_TYPE;
  burstLimit?: number; // for Token Bucket / Leaky Bucket
  refillRate?: number; // for Token Bucket
  leakRate?: number; // for Leaky Bucket
}

export const RATE_LIMIT_PROFILES = {
  // Register Endpoint Protection
  REGISTER_IP: {
    type: "register-ip",
    algorithm: RATE_LIMIT_STRATEGY.SLIDING_WINDOW,
    limit: 5,
    windowSeconds: 3600, // 1 hour
    identifierType: IDENTIFIER_TYPE.IP,
  } as RateLimitRuleConfig,

  REGISTER_EMAIL: {
    type: "register-email",
    algorithm: RATE_LIMIT_STRATEGY.FIXED_WINDOW,
    limit: 2,
    windowSeconds: 60, // 1 minute
    identifierType: IDENTIFIER_TYPE.EMAIL,
  } as RateLimitRuleConfig,

  // Login Endpoint Protection
  LOGIN_IP: {
    type: "login-ip",
    algorithm: RATE_LIMIT_STRATEGY.SLIDING_WINDOW,
    limit: 10,
    windowSeconds: 60, // 1 minute
    identifierType: IDENTIFIER_TYPE.IP,
  } as RateLimitRuleConfig,

  LOGIN_BRUTE_FORCE: {
    maxFailedAttempts: 5,
    lockoutDurationSeconds: 900, // 15 minutes
    enableExponentialBackoff: true,
    maxBackoffMultiplier: 4, // Max lock = 15 * 4 = 60 minutes
  },

  // Forgot Password Protection
  FORGOT_PASSWORD_EMAIL: {
    type: "forgot-password-email",
    algorithm: RATE_LIMIT_STRATEGY.TOKEN_BUCKET,
    limit: 3,
    windowSeconds: 3600, // 1 hour
    burstLimit: 3,
    refillRate: 1 / 1200, // 1 token every 20 minutes
    identifierType: IDENTIFIER_TYPE.EMAIL,
  } as RateLimitRuleConfig,

  FORGOT_PASSWORD_IP: {
    type: "forgot-password-ip",
    algorithm: RATE_LIMIT_STRATEGY.SLIDING_WINDOW,
    limit: 5,
    windowSeconds: 3600, // 1 hour
    identifierType: IDENTIFIER_TYPE.IP,
  } as RateLimitRuleConfig,

  // Reset Password Protection
  RESET_PASSWORD_IP: {
    type: "reset-password-ip",
    algorithm: RATE_LIMIT_STRATEGY.SLIDING_WINDOW,
    limit: 3,
    windowSeconds: 3600,
    identifierType: IDENTIFIER_TYPE.IP,
  } as RateLimitRuleConfig,

  // OTP Verification Protection
  OTP_VERIFY: {
    type: "otp-verify",
    algorithm: RATE_LIMIT_STRATEGY.FIXED_WINDOW,
    limit: 5,
    windowSeconds: 600, // 10 minutes window
    identifierType: IDENTIFIER_TYPE.EMAIL,
    maxFailuresBeforeLock: 5,
    lockDurationSeconds: 1800, // 30 minutes OTP lock
  },

  // Refresh Token Protection
  REFRESH_TOKEN_USER: {
    type: "refresh-token-user",
    algorithm: RATE_LIMIT_STRATEGY.LEAKY_BUCKET,
    limit: 30,
    windowSeconds: 60, // 30 req / minute
    leakRate: 0.5, // 1 request every 2 seconds leak rate
    identifierType: IDENTIFIER_TYPE.USER_ID,
  } as RateLimitRuleConfig,

  // Email Verification Resend Protection
  EMAIL_VERIFICATION_RESEND: {
    type: "email-verify-resend",
    algorithm: RATE_LIMIT_STRATEGY.SLIDING_WINDOW,
    limit: 3,
    windowSeconds: 3600, // 3 resends / hour
    identifierType: IDENTIFIER_TYPE.EMAIL,
  } as RateLimitRuleConfig,

  // Change Password Protection
  CHANGE_PASSWORD_USER: {
    type: "change-password-user",
    algorithm: RATE_LIMIT_STRATEGY.SLIDING_WINDOW,
    limit: 5,
    windowSeconds: 3600, // 5 / hour
    identifierType: IDENTIFIER_TYPE.USER_ID,
  } as RateLimitRuleConfig,
} as const;

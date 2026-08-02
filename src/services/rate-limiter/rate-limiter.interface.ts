import type { IDENTIFIER_TYPE, RATE_LIMIT_STRATEGY } from "@constants";
import type { Request } from "express";

export interface RateLimiterOptions {
  type: string;
  limit: number;
  windowSeconds: number;
  algorithm?: RATE_LIMIT_STRATEGY;
  identifierType?: IDENTIFIER_TYPE;
  burstLimit?: number;
  refillRate?: number;
  leakRate?: number;
  keyGenerator?: (req: Request) => string;
  customErrorMessage?: string;
}

export interface RateLimiterResult {
  isAllowed: boolean;
  totalLimit: number;
  remaining: number;
  resetTimeSeconds: number;
}

export interface IRateLimiterAlgorithm {
  evaluate(key: string, options: RateLimiterOptions): Promise<RateLimiterResult>;
}

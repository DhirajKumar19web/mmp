import { config } from "@config";
import { IDENTIFIER_TYPE, RATE_LIMIT_HEADERS, RATE_LIMIT_STRATEGY } from "@constants";
import { TooManyRequestsError } from "@errors";
import { metricsService } from "@services/metrics";
import { RateLimiterAlgorithmFactory, type RateLimiterOptions } from "@services/rate-limiter";
import { ClientIdentifierResolver, SecurityLogger } from "@utils";

import type { NextFunction, Request, Response } from "express";

/**
 * Universal Rate Limiter Express Middleware
 */
export const rateLimiter = (options: RateLimiterOptions) => {
  const algorithmType = options.algorithm ?? RATE_LIMIT_STRATEGY.SLIDING_WINDOW;
  const identifierType = options.identifierType ?? IDENTIFIER_TYPE.IP;
  const algorithm = RateLimiterAlgorithmFactory.getAlgorithm(algorithmType);

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const effectiveLimit = config.server.env === "development" ? 10000 : options.limit;
      const effectiveOptions: RateLimiterOptions = {
        ...options,
        limit: effectiveLimit,
      };

      // Determine client identifier key
      const rawIdentifier = effectiveOptions.keyGenerator
        ? effectiveOptions.keyGenerator(req)
        : ClientIdentifierResolver.resolveIdentifier(req, identifierType);

      const compositeKey = `${effectiveOptions.type}:${identifierType}:${rawIdentifier}`;

      // Evaluate rate limit algorithm
      const result = await algorithm.evaluate(compositeKey, effectiveOptions);

      // Set standard HTTP headers
      res.setHeader(RATE_LIMIT_HEADERS.LIMIT, result.totalLimit.toString());
      res.setHeader(RATE_LIMIT_HEADERS.REMAINING, result.remaining.toString());
      res.setHeader(RATE_LIMIT_HEADERS.RESET, result.resetTimeSeconds.toString());

      if (!result.isAllowed) {
        res.setHeader(RATE_LIMIT_HEADERS.RETRY_AFTER, result.resetTimeSeconds.toString());

        // Record Prometheus metrics
        const endpoint = req.baseUrl + req.path;
        metricsService.blockedRequestsTotal.inc({
          endpoint,
          strategy: algorithmType,
          identifier_type: identifierType,
        });
        metricsService.rateLimitHitsTotal.inc({ endpoint, status: "blocked" });

        // Security audit logging
        SecurityLogger.logBlockedRequest(
          req,
          effectiveOptions.type,
          `Rate limit exceeded. Retry after ${String(result.resetTimeSeconds)} seconds.`
        );

        const errorMessage =
          effectiveOptions.customErrorMessage ??
          `Too many requests. Try again after ${String(result.resetTimeSeconds)} seconds.`;

        throw new TooManyRequestsError(errorMessage, result.resetTimeSeconds);
      }

      // Track successful allowed request hit
      metricsService.rateLimitHitsTotal.inc({
        endpoint: req.baseUrl + req.path,
        status: "allowed",
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Pre-configured Global Rate Limiter Middleware
 */
export const globalRateLimiter = rateLimiter({
  type: "global-api",
  limit: config.rateLimit.global.max,
  windowSeconds: Math.ceil(config.rateLimit.global.windowMs / 1000),
  algorithm: RATE_LIMIT_STRATEGY.SLIDING_WINDOW,
  identifierType: IDENTIFIER_TYPE.IP,
});

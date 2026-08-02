import { RATE_LIMIT_STRATEGY } from "@constants";
import { redisService } from "@redis";

import type {
  IRateLimiterAlgorithm,
  RateLimiterOptions,
  RateLimiterResult,
} from "./rate-limiter.interface";

class SlidingWindowAlgorithm implements IRateLimiterAlgorithm {
  public async evaluate(key: string, options: RateLimiterOptions): Promise<RateLimiterResult> {
    const currentCountStr = await redisService.get(key);
    const currentCount = currentCountStr ? parseInt(currentCountStr, 10) : 0;
    const limit = options.limit;
    const isAllowed = currentCount < limit;

    if (isAllowed) {
      await redisService.set(key, currentCount + 1, options.windowSeconds);
    }

    const remaining = Math.max(0, limit - (currentCount + (isAllowed ? 1 : 0)));

    return {
      isAllowed,
      totalLimit: limit,
      remaining,
      resetTimeSeconds: options.windowSeconds,
    };
  }
}

class FixedWindowAlgorithm implements IRateLimiterAlgorithm {
  public async evaluate(key: string, options: RateLimiterOptions): Promise<RateLimiterResult> {
    const currentCountStr = await redisService.get(key);
    const currentCount = currentCountStr ? parseInt(currentCountStr, 10) : 0;
    const limit = options.limit;
    const isAllowed = currentCount < limit;

    if (isAllowed) {
      await redisService.set(key, currentCount + 1, options.windowSeconds);
    }

    const remaining = Math.max(0, limit - (currentCount + (isAllowed ? 1 : 0)));

    return {
      isAllowed,
      totalLimit: limit,
      remaining,
      resetTimeSeconds: options.windowSeconds,
    };
  }
}

const slidingWindow = new SlidingWindowAlgorithm();
const fixedWindow = new FixedWindowAlgorithm();

export const RateLimiterAlgorithmFactory = {
  getAlgorithm(strategy: RATE_LIMIT_STRATEGY): IRateLimiterAlgorithm {
    switch (strategy) {
      case RATE_LIMIT_STRATEGY.FIXED_WINDOW:
        return fixedWindow;
      case RATE_LIMIT_STRATEGY.SLIDING_WINDOW:
      default:
        return slidingWindow;
    }
  },
};

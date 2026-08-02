import { Counter, Registry } from "prom-client";

export class MetricsService {
  public readonly registry: Registry;
  public readonly rateLimitHitsTotal: Counter<"endpoint" | "status">;
  public readonly blockedRequestsTotal: Counter<"endpoint" | "strategy" | "identifier_type">;

  constructor() {
    this.registry = new Registry();

    this.rateLimitHitsTotal = new Counter({
      name: "rate_limit_hits_total",
      help: "Total rate limit evaluation hits",
      labelNames: ["endpoint", "status"],
      registers: [this.registry],
    });

    this.blockedRequestsTotal = new Counter({
      name: "rate_limit_blocked_requests_total",
      help: "Total requests blocked by rate limiter",
      labelNames: ["endpoint", "strategy", "identifier_type"],
      registers: [this.registry],
    });
  }
}

export const metricsService = new MetricsService();

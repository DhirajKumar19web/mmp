import { Cluster, Redis, type RedisOptions } from "ioredis";

import { config, logger } from "@config";
import { LUA_SCRIPTS } from "@redis/lua-scripts";

interface StoreEntry {
  value: number;
  expiresAt?: number;
}

export class RedisService {
  private static instance?: RedisService;
  private client: Redis | Cluster | null = null;
  private isConnected = false;
  private inMemoryStore = new Map<string, StoreEntry>();

  private constructor() {
    this.initClient();
  }

  public static getInstance(): RedisService {
    return (RedisService.instance ??= new RedisService());
  }

  private initClient(): void {
    try {
      const opts: RedisOptions = {
        host: config.redis.host,
        port: config.redis.port,
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        connectTimeout: 1000,
        enableOfflineQueue: false,
        retryStrategy: () => null, // Do not retry continuously when Redis is offline
      };

      if (config.redis.password) {
        opts.password = config.redis.password;
      }
      if (config.redis.keyPrefix) {
        opts.keyPrefix = config.redis.keyPrefix;
      }

      const redisOpts = opts as unknown as Record<string, unknown>;

      const clusterNodes = config.redis.clusterNodes;
      if (clusterNodes.length > 0) {
        logger.info("Initializing Redis Cluster connection...");
        this.client = new Cluster(clusterNodes, {
          redisOptions: redisOpts,
          scaleReads: "slave",
        } as unknown as Record<string, unknown>);
      } else if (config.redis.url) {
        this.client = new Redis(config.redis.url, redisOpts);
      } else {
        this.client = new Redis(redisOpts);
      }

      this.client.on("connect", () => {
        this.isConnected = true;
        logger.info("Redis Client Connected Successfully");
      });

      this.client.on("error", (error: Error) => {
        this.isConnected = false;
        logger.error({ err: error }, "Redis client connection error");
      });

      // Trigger connection attempt
      this.client.connect().catch((error: unknown) => {
        this.isConnected = false;
        logger.error({ err: error }, "Redis connection attempt failed");
      });
    } catch (error) {
      this.isConnected = false;
      logger.error({ err: error }, "Redis client initialization failed");
    }
  }

  public getClient(): Redis | Cluster | null {
    return this.client;
  }

  public getIsConnected(): boolean {
    return this.isConnected && this.client !== null && this.client.status === "ready";
  }

  /**
   * Disconnect client gracefully for testing teardowns
   */
  public async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
      } catch (error) {
        logger.error({ err: error }, "Redis quit failed, forcefully disconnecting client");
        this.client.disconnect();
      }
      this.client = null;
      this.isConnected = false;
    }
  }

  /**
   * Execute Lua Script safely across Single Node, Cluster, or In-Memory fallback
   */
  public async evalScript(
    script: string,
    numKeys: number,
    keys: string[],
    args: (string | number)[]
  ): Promise<[number, number, number]> {
    if (this.getIsConnected() && this.client) {
      try {
        const result = (await this.client.eval(
          script,
          numKeys,
          ...keys,
          ...args.map(String)
        )) as unknown[];

        return [Number(result[0] ?? 0), Number(result[1] ?? 0), Number(result[2] ?? 1)];
      } catch (error) {
        logger.error(
          { err: error },
          "Redis evalScript execution failed; falling back to in-memory store"
        );
      }
    }

    // Fallback for tests / offline mode: In-memory simulation of Rate Limiter
    let limit = 100;
    let windowSeconds = 60;

    if (script === LUA_SCRIPTS.SLIDING_WINDOW) {
      windowSeconds = Math.max(1, Math.ceil(Number(args[1] ?? 60000) / 1000));
      limit = Number(args[2] ?? 100);
    } else if (script === LUA_SCRIPTS.TOKEN_BUCKET || script === LUA_SCRIPTS.LEAKY_BUCKET) {
      limit = Number(args[0] ?? 100);
      windowSeconds = Number(args[4] ?? 60);
    } else {
      limit = Number(args[0] ?? 100);
      windowSeconds = Number(args[1] ?? 60);
    }

    return this.fallbackFixedWindow(keys[0] ?? "default", limit, windowSeconds);
  }

  private fallbackFixedWindow(
    key: string,
    limit: number,
    windowSeconds: number
  ): [number, number, number] {
    const now = Date.now();
    const entry = this.inMemoryStore.get(key);

    if (!entry || (entry.expiresAt !== undefined && entry.expiresAt < now)) {
      const newExpires = now + windowSeconds * 1000;
      this.inMemoryStore.set(key, { value: 1, expiresAt: newExpires });
      return [1, windowSeconds, 1];
    }

    entry.value += 1;
    const expiresAt = entry.expiresAt ?? now + windowSeconds * 1000;
    const ttlSeconds = Math.max(1, Math.ceil((expiresAt - now) / 1000));
    const allowed = entry.value <= limit ? 1 : 0;

    return [entry.value, ttlSeconds, allowed];
  }

  /**
   * Generic Key Value Operations
   */
  public async get(key: string): Promise<string | null> {
    if (this.getIsConnected() && this.client) {
      try {
        return await this.client.get(key);
      } catch (error) {
        logger.error({ err: error }, "Redis get operation failed; falling back to in-memory store");
      }
    }
    const entry = this.inMemoryStore.get(key);
    if (entry?.expiresAt !== undefined && entry.expiresAt < Date.now()) {
      this.inMemoryStore.delete(key);
      return null;
    }
    return entry ? String(entry.value) : null;
  }

  public async set(key: string, value: string | number, ttlSeconds?: number): Promise<void> {
    if (this.getIsConnected() && this.client) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, String(value), "EX", ttlSeconds);
        } else {
          await this.client.set(key, String(value));
        }
        return;
      } catch (error) {
        logger.error({ err: error }, "Redis set operation failed; falling back to in-memory store");
      }
    }
    const numericValue = typeof value === "number" ? value : Number(value);
    if (ttlSeconds !== undefined) {
      this.inMemoryStore.set(key, {
        value: numericValue,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });
    } else {
      this.inMemoryStore.set(key, { value: numericValue });
    }
  }

  public async del(key: string): Promise<void> {
    if (this.getIsConnected() && this.client) {
      try {
        await this.client.del(key);
        return;
      } catch (error) {
        logger.error({ err: error }, "Redis del operation failed; falling back to in-memory store");
      }
    }
    this.inMemoryStore.delete(key);
  }
}

export const redisService = RedisService.getInstance();

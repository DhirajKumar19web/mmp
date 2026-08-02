import { redisService } from "@redis";

export class RedisAuthService {
  /**
   * Distributed Lock to prevent simultaneous refresh requests with same JTI
   */
  public async acquireRefreshLock(jti: string, ttlSeconds = 10): Promise<boolean> {
    const key = `auth:refresh-lock:${jti}`;
    return redisService.setNX(key, "1", ttlSeconds);
  }

  public async releaseRefreshLock(jti: string): Promise<void> {
    const key = `auth:refresh-lock:${jti}`;
    await redisService.del(key);
  }

  /**
   * Session Caching
   */
  public async cacheSession(
    sessionId: string,
    data: Record<string, unknown>,
    ttlSeconds = 86400 * 30
  ): Promise<void> {
    const key = `auth:session:${sessionId}`;
    await redisService.set(key, JSON.stringify(data), ttlSeconds);
  }

  public async getCachedSession(sessionId: string): Promise<Record<string, unknown> | null> {
    const key = `auth:session:${sessionId}`;
    const str = await redisService.get(key);
    if (!str) return null;
    try {
      return JSON.parse(str) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  public async deleteCachedSession(sessionId: string): Promise<void> {
    const key = `auth:session:${sessionId}`;
    await redisService.del(key);
  }

  /**
   * Global Logout Versioning
   */
  public async getGlobalLogoutVersion(): Promise<number> {
    const str = await redisService.get("auth:global_version");
    return str ? parseInt(str, 10) : 0;
  }

  public async incrementGlobalLogoutVersion(): Promise<number> {
    const current = await this.getGlobalLogoutVersion();
    const next = current + 1;
    await redisService.set("auth:global_version", next);
    return next;
  }

  /**
   * User Token Versioning
   */
  public async getUserTokenVersion(userId: string): Promise<number> {
    const str = await redisService.get(`auth:user:version:${userId}`);
    return str ? parseInt(str, 10) : 0;
  }

  public async incrementUserTokenVersion(userId: string): Promise<number> {
    const current = await this.getUserTokenVersion(userId);
    const next = current + 1;
    await redisService.set(`auth:user:version:${userId}`, next);
    return next;
  }
}

export const redisAuthService = new RedisAuthService();

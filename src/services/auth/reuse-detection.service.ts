import { refreshTokenRepository, sessionRepository } from "@/repositories";
import { ForbiddenError } from "@errors";

import { auditService } from "./audit.service";
import { redisAuthService } from "./redis-auth.service";

export interface ReuseDetectionInput {
  familyId: string;
  sessionId?: string | null;
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export class ReuseDetectionService {
  /**
   * Triggers immediate security incident response upon detecting a replayed/reused Refresh Token
   */
  public async handleReuseDetected(input: ReuseDetectionInput): Promise<never> {
    const { familyId, sessionId, userId, ipAddress, userAgent } = input;

    // 1. Revoke entire Token Family in DB
    await refreshTokenRepository.revokeFamily(familyId, "REUSE_DETECTION_FAMILY_REVOKED");

    // 2. Revoke associated session if present
    if (sessionId) {
      await sessionRepository.revokeSession(sessionId);
      await redisAuthService.deleteCachedSession(sessionId);
    }

    // 3. Queue Non-blocking Audit Log Event
    auditService.logEvent({
      event: "TOKEN_REUSE_DETECTED",
      ...(userId ? { userId } : {}),
      ...(ipAddress ? { ipAddress } : {}),
      ...(userAgent ? { userAgent } : {}),
      details: {
        familyId,
        ...(sessionId ? { sessionId } : {}),
        reason: "Refresh token reuse attempt detected. Family revoked.",
      },
    });

    // 4. Force user re-authentication
    throw new ForbiddenError(
      "Security Alert: Refresh token reuse detected. All active sessions have been revoked. Please log in again."
    );
  }
}

export const reuseDetectionService = new ReuseDetectionService();

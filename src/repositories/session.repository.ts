import { SessionModel } from "@/models";

import type { ISession } from "@/types/session";
import type { ClientSession, Types } from "mongoose";

export class SessionRepository {
  public async createSession(
    data: Partial<ISession>,
    dbSession?: ClientSession
  ): Promise<ISession> {
    const options = dbSession ? { session: dbSession } : undefined;
    const docs = await SessionModel.create([data], options);
    const doc = docs[0];
    if (!doc) {
      throw new Error("Failed to create session document");
    }
    return doc;
  }

  public async findBySessionId(sessionId: string): Promise<ISession | null> {
    return SessionModel.findOne({ sessionId, isRevoked: false });
  }

  public async revokeSession(sessionId: string, dbSession?: ClientSession): Promise<void> {
    const options = dbSession ? { session: dbSession } : undefined;
    await SessionModel.updateOne({ sessionId }, { isRevoked: true }, options);
  }

  public async revokeAllUserSessions(
    userId: Types.ObjectId | string,
    dbSession?: ClientSession
  ): Promise<void> {
    const options = dbSession ? { session: dbSession } : undefined;
    await SessionModel.updateMany({ user: userId, isRevoked: false }, { isRevoked: true }, options);
  }

  public async getUserActiveSessions(userId: Types.ObjectId | string): Promise<ISession[]> {
    return SessionModel.find({ user: userId, isRevoked: false }).sort({ lastActiveAt: -1 });
  }
}

export const sessionRepository = new SessionRepository();

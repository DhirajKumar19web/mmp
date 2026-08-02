import { RefreshTokenModel } from "@/models";

import type { IRefreshToken } from "@/types/refresh-token";
import type { ClientSession, Types } from "mongoose";

export class RefreshTokenRepository {
  public async createToken(
    data: Partial<IRefreshToken>,
    dbSession?: ClientSession
  ): Promise<IRefreshToken> {
    const options = dbSession ? { session: dbSession } : undefined;
    const docs = await RefreshTokenModel.create([data], options);
    const doc = docs[0];
    if (!doc) {
      throw new Error("Failed to create refresh token document");
    }
    return doc;
  }

  public async findByTokenHash(tokenHash: string): Promise<IRefreshToken | null> {
    return RefreshTokenModel.findOne({ tokenHash });
  }

  public async markAsUsed(
    tokenHash: string,
    replacedByTokenHash: string,
    dbSession?: ClientSession
  ): Promise<void> {
    const options = dbSession ? { session: dbSession } : undefined;
    await RefreshTokenModel.updateOne(
      { tokenHash },
      {
        status: "used",
        lastUsedAt: new Date(),
        replacedByTokenHash,
      },
      options
    );
  }

  public async revokeFamily(
    familyId: string,
    reason: string,
    dbSession?: ClientSession
  ): Promise<void> {
    const options = dbSession ? { session: dbSession } : undefined;
    await RefreshTokenModel.updateMany(
      { familyId },
      {
        isRevoked: true,
        status: "revoked",
        revokedAt: new Date(),
        revokeReason: reason,
      },
      options
    );
  }

  public async revokeAllUserTokens(
    userId: Types.ObjectId | string,
    reason: string,
    dbSession?: ClientSession
  ): Promise<void> {
    const options = dbSession ? { session: dbSession } : undefined;
    await RefreshTokenModel.updateMany(
      { user: userId, isRevoked: false },
      {
        isRevoked: true,
        status: "revoked",
        revokedAt: new Date(),
        revokeReason: reason,
      },
      options
    );
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();

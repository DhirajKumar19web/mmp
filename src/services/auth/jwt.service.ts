import {
  generateAuthTokens,
  verifyAccessToken,
  verifyRefreshToken,
  type TokenPayload,
} from "@utils";

export class JWTService {
  public generateTokens(
    payload: Omit<TokenPayload, "jti" | "familyId"> &
      Partial<Pick<TokenPayload, "jti" | "familyId">>
  ) {
    return generateAuthTokens(payload);
  }

  public verifyAccess(token: string) {
    return verifyAccessToken(token);
  }

  public verifyRefresh(token: string) {
    return verifyRefreshToken(token);
  }
}

export const jwtService = new JWTService();

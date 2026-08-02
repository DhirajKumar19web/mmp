import { ApiResponse, HTTP_STATUS, UnauthorizedError } from "@common";
import { authService } from "@services/auth";

import type { RegisterInput } from "@services/auth/types";
import type { Request, Response } from "express";

export class AuthController {
  public async register(req: Request, res: Response): Promise<void> {
    const meta = {
      ...(req.ip ? { ipAddress: req.ip } : {}),
      ...(req.headers["user-agent"] ? { userAgent: req.headers["user-agent"] } : {}),
    };
    const input = req.body as RegisterInput;
    const result = await authService.register(input, meta);

    res.cookie("refreshToken", result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(HTTP_STATUS.CREATED).json(
      ApiResponse.success({
        statusCode: HTTP_STATUS.CREATED,
        message: "User registered successfully",
        data: result,
      })
    );
  }

  public async refreshToken(req: Request, res: Response): Promise<void> {
    const cookies = req.cookies as Record<string, string | undefined> | undefined;
    const body = req.body as Record<string, string | undefined> | undefined;

    const refreshToken = cookies?.refreshToken ?? body?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token is missing");
    }

    const meta = {
      ...(req.ip ? { ipAddress: req.ip } : {}),
      ...(req.headers["user-agent"] ? { userAgent: req.headers["user-agent"] } : {}),
    };

    const tokens = await authService.refreshTokens(refreshToken, meta);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.success({
        statusCode: HTTP_STATUS.OK,
        message: "Tokens rotated successfully",
        data: tokens,
      })
    );
  }
}

export const authController = new AuthController();

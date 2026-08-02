import type { Request, Response } from "express";

export class AuthController {
  public async login(_req: Request, res: Response): Promise<void> {
    await Promise.resolve();
    res.status(200).json({ message: "Login placeholder" });
  }
}

export const authController = new AuthController();

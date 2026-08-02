import { Router } from "express";

import { asyncHandler } from "@common";
import { authController } from "@controllers/auth";

const router = Router();

router.post(
  "/register",
  asyncHandler((req, res) => authController.register(req, res))
);

router.post(
  "/refresh-token",
  asyncHandler((req, res) => authController.refreshToken(req, res))
);

export const authRouter = router;
export default authRouter;

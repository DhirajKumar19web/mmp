import { Router } from "express";

import { authRouter } from "@/routes/auth";

const rootRouter = Router();

rootRouter.use("/auth", authRouter);

export { rootRouter };
export default rootRouter;

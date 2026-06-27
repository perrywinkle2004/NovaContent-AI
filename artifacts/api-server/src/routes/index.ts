import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import campaignsRouter from "./campaigns";
import generateRouter from "./generate";
import analyticsRouter from "./analytics";
import exportRouter from "./export";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(campaignsRouter);
router.use(generateRouter);
router.use(analyticsRouter);
router.use(exportRouter);

export default router;

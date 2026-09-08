import { Router, type IRouter } from "express";
import healthRouter from "./health";
import voxaRouter from "./voxa";

const router: IRouter = Router();

router.use(healthRouter);
router.use(voxaRouter);

export default router;

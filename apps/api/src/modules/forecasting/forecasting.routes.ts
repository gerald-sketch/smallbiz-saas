import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as c from "./forecasting.controller";

export const forecastingRouter = Router();

forecastingRouter.use(requireAuth);
forecastingRouter.use(requireRole(["OWNER", "MANAGER"]));

forecastingRouter.get("/insights", c.getInsights);

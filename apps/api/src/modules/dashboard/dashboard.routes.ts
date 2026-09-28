import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as c from "./dashboard.controller";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get("/summary", c.summary);

const UserIdParam = z.object({ userId: z.string().uuid() });

dashboardRouter.get(
  "/staff",
  requireRole(["OWNER", "MANAGER"]),
  c.staffOverview,
);

dashboardRouter.get(
  "/staff/:userId",
  requireRole(["OWNER", "MANAGER"]),
  validate({ params: UserIdParam }),
  c.staffDetail,
);

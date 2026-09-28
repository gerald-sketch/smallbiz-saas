import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as c from "./settings.controller";

export const settingsRouter = Router();
settingsRouter.use(requireAuth);

const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  taxRate: z.number().min(0).max(1).optional(),
  gcashQrUrl: z.string().max(700_000).nullable().optional(),
  mayaQrUrl: z.string().max(700_000).nullable().optional(),
});

settingsRouter.get("/", c.getProfile);

settingsRouter.patch(
  "/business",
  requireRole(["OWNER"]),
  validate({ body: UpdateProfileSchema }),
  c.updateProfile,
);

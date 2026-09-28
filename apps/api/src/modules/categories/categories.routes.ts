import { Router } from "express";
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  ProductIdParam,
} from "@sb/shared";
import { validate } from "../../middleware/validate";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as c from "./categories.controller";

export const categoriesRouter = Router();
categoriesRouter.use(requireAuth);

categoriesRouter.get("/", c.list);

categoriesRouter.post(
  "/",
  requireRole(["OWNER", "MANAGER"]),
  validate({ body: CreateCategorySchema }),
  c.create,
);

categoriesRouter.patch(
  "/:id",
  requireRole(["OWNER", "MANAGER"]),
  validate({ params: ProductIdParam, body: UpdateCategorySchema }),
  c.update,
);

categoriesRouter.delete(
  "/:id",
  requireRole(["OWNER", "MANAGER"]),
  validate({ params: ProductIdParam }),
  c.remove,
);

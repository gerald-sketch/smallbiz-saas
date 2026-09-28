import { Router } from "express";
import {
  CreateSupplierSchema,
  UpdateSupplierSchema,
  ProductIdParam,
} from "@sb/shared";
import { validate } from "../../middleware/validate";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as c from "./suppliers.controller";

export const suppliersRouter = Router();
suppliersRouter.use(requireAuth);

suppliersRouter.get("/", c.list);
suppliersRouter.get("/:id", validate({ params: ProductIdParam }), c.getById);

suppliersRouter.post(
  "/",
  requireRole(["OWNER", "MANAGER"]),
  validate({ body: CreateSupplierSchema }),
  c.create,
);
suppliersRouter.patch(
  "/:id",
  requireRole(["OWNER", "MANAGER"]),
  validate({ params: ProductIdParam, body: UpdateSupplierSchema }),
  c.update,
);
suppliersRouter.delete(
  "/:id",
  requireRole(["OWNER", "MANAGER"]),
  validate({ params: ProductIdParam }),
  c.remove,
);

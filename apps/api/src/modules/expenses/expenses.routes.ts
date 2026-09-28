import { Router } from "express";
import {
  CreateExpenseSchema,
  UpdateExpenseSchema,
  ProductIdParam,
} from "@sb/shared";
import { validate } from "../../middleware/validate";
import { requireAuth, requireRole } from "../../middleware/auth";
import { idempotent } from "../../middleware/idempotency";
import * as c from "./expenses.controller";

export const expensesRouter = Router();
expensesRouter.use(requireAuth);

expensesRouter.get("/", c.list);
expensesRouter.get("/summary", c.summary);

expensesRouter.post(
  "/",
  requireRole(["OWNER", "MANAGER"]),
  idempotent("expenses.create"),
  validate({ body: CreateExpenseSchema }),
  c.create,
);

expensesRouter.patch(
  "/:id",
  requireRole(["OWNER", "MANAGER"]),
  validate({ params: ProductIdParam, body: UpdateExpenseSchema }),
  c.update,
);

expensesRouter.delete(
  "/:id",
  requireRole(["OWNER", "MANAGER"]),
  validate({ params: ProductIdParam }),
  c.remove,
);

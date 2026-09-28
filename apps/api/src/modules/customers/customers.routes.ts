import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import * as c from "./customers.controller";

export const customersRouter = Router();
customersRouter.use(requireAuth);

const CreateCustomerSchema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(1).max(32).optional(),
  email: z.string().email().max(255).optional(),
});

customersRouter.get("/", c.list);
customersRouter.get("/:id", c.getById);
customersRouter.post("/", validate({ body: CreateCustomerSchema }), c.create);

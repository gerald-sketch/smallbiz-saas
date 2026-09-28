import { z } from "zod";

export const PlanEnum = z.enum(["FREE", "STARTER", "PRO"]);

export const CreateCheckoutSchema = z.object({
  plan: PlanEnum.refine((p) => p !== "FREE", "Cannot checkout the FREE plan"),
});

export type CreateCheckoutInput = z.infer<typeof CreateCheckoutSchema>;

import { z } from "zod";

export const CreateExpenseSchema = z.object({
  category: z.string().min(1).max(64),
  description: z.string().min(1).max(500),
  amount: z.number().positive(),
  spentAt: z.coerce.date().optional(),
});

export const UpdateExpenseSchema = CreateExpenseSchema.partial();

export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof UpdateExpenseSchema>;

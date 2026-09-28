import { z } from "zod";

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(64),
  sortOrder: z.number().int().min(0).default(0),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;

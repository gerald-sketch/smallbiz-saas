import { z } from "zod";

export const ProductStatusEnum = z.enum(["ACTIVE", "DISCONTINUED"]);

export const CreateProductSchema = z.object({
  name: z.string().min(1).max(200),
  sku: z.string().min(1).max(64),
  categoryId: z.string().uuid().nullable().optional(),
  price: z.number().nonnegative(),
  cost: z.number().nonnegative().default(0),
  stock: z.number().int().nonnegative().default(0),
  status: ProductStatusEnum.default("ACTIVE"),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const ProductIdParam = z.object({
  id: z.string().uuid(),
});

export const ProductListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(10000).default(20),
  search: z.string().max(200).optional(),
  categoryId: z.string().uuid().optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

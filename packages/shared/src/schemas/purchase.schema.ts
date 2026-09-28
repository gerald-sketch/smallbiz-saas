import { z } from "zod";

export const CreateSupplierSchema = z.object({
  name: z.string().min(1).max(200),
  contact: z.string().max(120).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(32).optional(),
  address: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

export const UpdateSupplierSchema = CreateSupplierSchema.partial();

export const PurchaseItemInputSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitCost: z.number().nonnegative(),
});

export const CreatePurchaseSchema = z.object({
  supplierId: z.string().uuid(),
  reference: z.string().max(64).optional(),
  notes: z.string().max(1000).optional(),
  items: z.array(PurchaseItemInputSchema).min(1).max(200),
});

export type CreateSupplierInput = z.infer<typeof CreateSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof UpdateSupplierSchema>;
export type CreatePurchaseInput = z.infer<typeof CreatePurchaseSchema>;

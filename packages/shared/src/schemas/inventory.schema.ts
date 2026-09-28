import { z } from "zod";

export const AdjustStockSchema = z.object({
  productId: z.string().uuid(),
  delta: z.number().int(),
  reason: z.string().min(1).max(200),
});

export const StockInSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  reason: z.string().min(1).max(200).default("Stock in"),
});

export const StockOutSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  reason: z.string().min(1).max(200).default("Stock out"),
});

export type AdjustStockInput = z.infer<typeof AdjustStockSchema>;
export type StockInInput = z.infer<typeof StockInSchema>;
export type StockOutInput = z.infer<typeof StockOutSchema>;

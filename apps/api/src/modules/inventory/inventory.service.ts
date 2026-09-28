import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/errorHandler";
import { AdjustStockInput, StockInInput, StockOutInput } from "@sb/shared";

/**
 * Apply a stock delta atomically.
 *
 * Uses SELECT ... FOR UPDATE inside a transaction so two concurrent
 * adjustments on the same product serialize. Without this, both could
 * read stock=10, both subtract 8, and end at stock=2 instead of -6.
 */
async function applyDelta(
  businessId: string,
  productId: string,
  delta: number,
  _reason: string,
) {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<
      Array<{ id: string; stock: number; name: string }>
    >`
      SELECT id, stock, name FROM "Product"
      WHERE id::text = ${productId}
        AND "businessId"::text = ${businessId}
        AND "deletedAt" IS NULL
      FOR UPDATE
    `;

    if (rows.length === 0) {
      throw new AppError(404, "NOT_FOUND", "Product not found");
    }

    const current = rows[0].stock;
    const next = current + delta;

    if (next < 0) {
      throw new AppError(
        400,
        "INSUFFICIENT_STOCK",
        `Insufficient stock for "${rows[0].name}". Available: ${current}, requested: ${Math.abs(delta)}`,
      );
    }

    const updated = await tx.product.update({
      where: { id: productId },
      data: { stock: next },
    });

    return { product: updated, previous: current, delta };
  });
}

export async function adjust(businessId: string, input: AdjustStockInput) {
  return applyDelta(businessId, input.productId, input.delta, input.reason);
}

export async function stockIn(businessId: string, input: StockInInput) {
  return applyDelta(businessId, input.productId, input.quantity, input.reason);
}

export async function stockOut(businessId: string, input: StockOutInput) {
  return applyDelta(businessId, input.productId, -input.quantity, input.reason);
}

export async function lowStock(businessId: string, threshold = 5) {
  return prisma.product.findMany({
    where: { businessId, deletedAt: null, stock: { lte: threshold } },
    orderBy: { stock: "asc" },
    take: 50,
  });
}

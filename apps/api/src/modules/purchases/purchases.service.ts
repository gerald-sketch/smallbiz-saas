import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/errorHandler";
import { CreatePurchaseInput } from "@sb/shared";

export async function create(
  businessId: string,
  _userId: string,
  input: CreatePurchaseInput,
) {
  const supplier = await prisma.supplier.findFirst({
    where: { id: input.supplierId, businessId, deletedAt: null },
    select: { id: true },
  });
  if (!supplier) {
    throw new AppError(404, "SUPPLIER_NOT_FOUND", "Supplier not found");
  }

  const productIds = input.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, businessId, deletedAt: null },
    select: { id: true, name: true, sku: true },
  });
  if (products.length !== new Set(productIds).size) {
    throw new AppError(
      404,
      "PRODUCT_NOT_FOUND",
      "One or more products not found",
    );
  }
  const byId = new Map(products.map((p) => [p.id, p]));

  const items = input.items.map((item) => {
    const p = byId.get(item.productId);
    if (!p) throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found");
    return {
      productId: item.productId,
      name: p.name,
      sku: p.sku,
      quantity: item.quantity,
      unitCost: item.unitCost,
      lineTotal: Math.round(item.unitCost * item.quantity * 100) / 100,
    };
  });

  const total =
    Math.round(items.reduce((sum, i) => sum + i.lineTotal, 0) * 100) / 100;

  return prisma.purchase.create({
    data: {
      businessId,
      supplierId: input.supplierId,
      reference: input.reference,
      notes: input.notes,
      total,
      status: "PENDING",
      items: { create: items },
    },
    include: { items: true, supplier: { select: { id: true, name: true } } },
  });
}

export async function receive(businessId: string, purchaseId: string) {
  return prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<Array<{ id: string; status: string }>>`
      SELECT id, status FROM "Purchase"
      WHERE id::text = ${purchaseId}
        AND "businessId"::text = ${businessId}
        AND "deletedAt" IS NULL
      FOR UPDATE
    `;

    if (locked.length === 0) {
      throw new AppError(404, "NOT_FOUND", "Purchase not found");
    }
    const status = locked[0].status;

    if (status === "RECEIVED") {
      const existing = await tx.purchase.findUnique({
        where: { id: purchaseId },
        include: { items: true, supplier: true },
      });
      if (!existing) {
        throw new AppError(404, "NOT_FOUND", "Purchase not found");
      }
      return existing;
    }

    if (status === "CANCELLED") {
      throw new AppError(
        400,
        "CANCELLED",
        "Cannot receive a cancelled purchase",
      );
    }

    const items = await tx.purchaseItem.findMany({ where: { purchaseId } });

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    return tx.purchase.update({
      where: { id: purchaseId },
      data: { status: "RECEIVED", receivedAt: new Date() },
      include: { items: true, supplier: true },
    });
  });
}

export async function cancel(businessId: string, purchaseId: string) {
  const purchase = await prisma.purchase.findFirst({
    where: { id: purchaseId, businessId, deletedAt: null },
  });
  if (!purchase) throw new AppError(404, "NOT_FOUND", "Purchase not found");
  if (purchase.status === "RECEIVED") {
    throw new AppError(
      400,
      "ALREADY_RECEIVED",
      "Cannot cancel a received purchase",
    );
  }
  return prisma.purchase.update({
    where: { id: purchaseId },
    data: { status: "CANCELLED" },
  });
}

export async function list(
  businessId: string,
  page: number,
  limit: number,
  status?: "PENDING" | "RECEIVED" | "CANCELLED",
) {
  const where = {
    businessId,
    deletedAt: null,
    ...(status ? { status } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.purchase.findMany({
      where,
      include: { items: true, supplier: { select: { id: true, name: true } } },
      orderBy: { orderedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.purchase.count({ where }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getById(businessId: string, id: string) {
  const p = await prisma.purchase.findFirst({
    where: { id, businessId, deletedAt: null },
    include: { items: true, supplier: true },
  });
  if (!p) throw new AppError(404, "NOT_FOUND", "Purchase not found");
  return p;
}

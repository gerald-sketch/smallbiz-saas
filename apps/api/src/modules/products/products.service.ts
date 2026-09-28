import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/errorHandler";
import { CreateProductInput, UpdateProductInput } from "@sb/shared";
import { Prisma } from "../../generated/prisma/client";

export async function list(
  businessId: string,
  page: number,
  limit: number,
  search?: string,
  categoryId?: string,
) {
  const where: Prisma.ProductWhereInput = {
    businessId,
    deletedAt: null,
    ...(categoryId ? { categoryId } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { sku: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getById(businessId: string, id: string) {
  const product = await prisma.product.findFirst({
    where: { id, businessId, deletedAt: null },
    include: { category: { select: { id: true, name: true } } },
  });
  if (!product) throw new AppError(404, "NOT_FOUND", "Product not found");
  return product;
}

async function assertCategoryBelongsToBusiness(
  businessId: string,
  categoryId: string | null | undefined,
) {
  if (!categoryId) return;
  const category = await prisma.category.findFirst({
    where: { id: categoryId, businessId, deletedAt: null },
    select: { id: true },
  });
  if (!category) {
    throw new AppError(400, "INVALID_CATEGORY", "Category not found");
  }
}

export async function create(
  businessId: string,
  _userId: string,
  input: CreateProductInput,
) {
  await assertCategoryBelongsToBusiness(businessId, input.categoryId);

  const existing = await prisma.product.findFirst({
    where: { businessId, sku: input.sku, deletedAt: null },
    select: { id: true },
  });
  if (existing) {
    throw new AppError(409, "SKU_TAKEN", "SKU already exists in this business");
  }

  return prisma.product.create({
    data: {
      businessId,
      name: input.name,
      sku: input.sku,
      categoryId: input.categoryId ?? null,
      price: input.price,
      cost: input.cost,
      stock: input.stock,
      status: input.status,
    },
    include: { category: { select: { id: true, name: true } } },
  });
}

export async function update(
  businessId: string,
  id: string,
  input: UpdateProductInput,
) {
  await getById(businessId, id);

  if (input.categoryId !== undefined) {
    await assertCategoryBelongsToBusiness(businessId, input.categoryId);
  }

  if (input.sku) {
    const conflicting = await prisma.product.findFirst({
      where: { businessId, sku: input.sku, id: { not: id }, deletedAt: null },
      select: { id: true },
    });
    if (conflicting) {
      throw new AppError(
        409,
        "SKU_TAKEN",
        "SKU already exists in this business",
      );
    }
  }

  return prisma.product.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.sku !== undefined && { sku: input.sku }),
      ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.cost !== undefined && { cost: input.cost }),
      ...(input.stock !== undefined && { stock: input.stock }),
      ...(input.status !== undefined && { status: input.status }),
    },
    include: { category: { select: { id: true, name: true } } },
  });
}

export async function softDelete(businessId: string, id: string) {
  await getById(businessId, id);
  return prisma.product.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

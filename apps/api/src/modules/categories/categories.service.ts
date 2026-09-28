import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/errorHandler";
import { CreateCategoryInput, UpdateCategoryInput } from "@sb/shared";

export async function list(businessId: string) {
  return prisma.category.findMany({
    where: { businessId, deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      sortOrder: true,
      createdAt: true,
      _count: { select: { products: { where: { deletedAt: null } } } },
    },
  });
}

export async function create(businessId: string, input: CreateCategoryInput) {
  const existing = await prisma.category.findFirst({
    where: { businessId, name: input.name, deletedAt: null },
    select: { id: true },
  });
  if (existing) {
    throw new AppError(
      409,
      "CATEGORY_TAKEN",
      "A category with that name already exists",
    );
  }

  return prisma.category.create({
    data: {
      businessId,
      name: input.name,
      sortOrder: input.sortOrder,
    },
    select: { id: true, name: true, sortOrder: true, createdAt: true },
  });
}

export async function update(
  businessId: string,
  id: string,
  input: UpdateCategoryInput,
) {
  const category = await prisma.category.findFirst({
    where: { id, businessId, deletedAt: null },
    select: { id: true },
  });
  if (!category) throw new AppError(404, "NOT_FOUND", "Category not found");

  if (input.name) {
    const conflicting = await prisma.category.findFirst({
      where: { businessId, name: input.name, id: { not: id }, deletedAt: null },
      select: { id: true },
    });
    if (conflicting) {
      throw new AppError(
        409,
        "CATEGORY_TAKEN",
        "A category with that name already exists",
      );
    }
  }

  return prisma.category.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
    },
    select: { id: true, name: true, sortOrder: true, createdAt: true },
  });
}

export async function softDelete(businessId: string, id: string) {
  const category = await prisma.category.findFirst({
    where: { id, businessId, deletedAt: null },
    select: { id: true },
  });
  if (!category) throw new AppError(404, "NOT_FOUND", "Category not found");

  // Products keep existing but lose their category (onDelete: SetNull)
  await prisma.category.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

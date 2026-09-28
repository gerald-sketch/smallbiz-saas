import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/errorHandler";
import { CreateSupplierInput, UpdateSupplierInput } from "@sb/shared";

export async function list(businessId: string, search?: string) {
  return prisma.supplier.findMany({
    where: {
      businessId,
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function getById(businessId: string, id: string) {
  const s = await prisma.supplier.findFirst({
    where: { id, businessId, deletedAt: null },
    include: {
      purchases: {
        where: { deletedAt: null },
        orderBy: { orderedAt: "desc" },
        take: 20,
      },
    },
  });
  if (!s) throw new AppError(404, "NOT_FOUND", "Supplier not found");
  return s;
}

export async function create(businessId: string, input: CreateSupplierInput) {
  return prisma.supplier.create({
    data: { businessId, ...input },
  });
}

export async function update(
  businessId: string,
  id: string,
  input: UpdateSupplierInput,
) {
  await getById(businessId, id);
  return prisma.supplier.update({ where: { id }, data: input });
}

export async function softDelete(businessId: string, id: string) {
  await getById(businessId, id);
  return prisma.supplier.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

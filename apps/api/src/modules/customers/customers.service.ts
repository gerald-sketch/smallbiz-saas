import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/errorHandler";

export async function list(businessId: string, search?: string) {
  return prisma.customer.findMany({
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
    take: 50,
  });
}

export async function create(
  businessId: string,
  input: { name: string; phone?: string; email?: string },
) {
  if (input.phone) {
    const dup = await prisma.customer.findFirst({
      where: { businessId, phone: input.phone, deletedAt: null },
      select: { id: true },
    });
    if (dup) throw new AppError(409, "PHONE_TAKEN", "Phone already registered");
  }
  return prisma.customer.create({
    data: {
      businessId,
      name: input.name,
      phone: input.phone,
      email: input.email,
    },
  });
}

export async function getById(businessId: string, id: string) {
  const c = await prisma.customer.findFirst({
    where: { id, businessId, deletedAt: null },
  });
  if (!c) throw new AppError(404, "NOT_FOUND", "Customer not found");
  return c;
}

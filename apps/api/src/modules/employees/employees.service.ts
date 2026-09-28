import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { AppError } from "../../middleware/errorHandler";
import { CreateEmployeeInput, UpdateEmployeeInput } from "@sb/shared";

export async function list(businessId: string) {
  return prisma.user.findMany({
    where: { businessId, deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function create(businessId: string, input: CreateEmployeeInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });
  if (existing) {
    throw new AppError(409, "EMAIL_TAKEN", "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);

  return prisma.user.create({
    data: {
      businessId,
      email: input.email,
      name: input.name,
      passwordHash,
      role: input.role,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
}

export async function update(
  businessId: string,
  id: string,
  input: UpdateEmployeeInput,
) {
  const user = await prisma.user.findFirst({
    where: { id, businessId, deletedAt: null },
    select: { id: true, role: true },
  });
  if (!user) throw new AppError(404, "NOT_FOUND", "Employee not found");

  return prisma.user.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.role !== undefined && { role: input.role }),
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
}

export async function hardDelete(
  businessId: string,
  id: string,
  requesterId: string,
) {
  if (id === requesterId) {
    throw new AppError(
      400,
      "SELF_DELETE",
      "You cannot delete your own account",
    );
  }

  const user = await prisma.user.findFirst({
    where: { id, businessId, deletedAt: null },
    select: { id: true, role: true },
  });
  if (!user) throw new AppError(404, "NOT_FOUND", "Employee not found");

  if (user.role === "OWNER") {
    const ownerCount = await prisma.user.count({
      where: { businessId, role: "OWNER", deletedAt: null },
    });
    if (ownerCount <= 1) {
      throw new AppError(400, "LAST_OWNER", "Cannot delete the last owner");
    }
  }

  await prisma.user.delete({ where: { id } });
}
export async function resetPassword(
  businessId: string,
  employeeId: string,
  newPassword: string,
  requesterId: string,
): Promise<void> {
  if (employeeId === requesterId) {
    throw new AppError(
      400,
      "SELF_RESET",
      "Use the forgot-password flow to change your own password",
    );
  }

  const user = await prisma.user.findFirst({
    where: { id: employeeId, businessId, deletedAt: null },
    select: { id: true },
  });
  if (!user) throw new AppError(404, "NOT_FOUND", "Employee not found");

  const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);

  await prisma.user.update({
    where: { id: employeeId },
    data: { passwordHash },
  });

  await prisma.passwordResetToken.deleteMany({
    where: { userId: employeeId, usedAt: null },
  });
}

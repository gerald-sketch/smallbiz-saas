import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/errorHandler";

export interface BusinessProfile {
  id: string;
  name: string;
  taxRate: number;
  gcashQrUrl: string | null;
  mayaQrUrl: string | null;
  createdAt: Date;
}

export async function getProfile(businessId: string): Promise<BusinessProfile> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      id: true,
      name: true,
      taxRate: true,
      gcashQrUrl: true,
      mayaQrUrl: true,
      createdAt: true,
    },
  });
  if (!business) throw new AppError(404, "NOT_FOUND", "Business not found");
  return {
    id: business.id,
    name: business.name,
    taxRate: Number(business.taxRate),
    gcashQrUrl: business.gcashQrUrl,
    mayaQrUrl: business.mayaQrUrl,
    createdAt: business.createdAt,
  };
}

export async function updateProfile(
  businessId: string,
  input: {
    name?: string;
    taxRate?: number;
    gcashQrUrl?: string | null;
    mayaQrUrl?: string | null;
  },
): Promise<BusinessProfile> {
  const updated = await prisma.business.update({
    where: { id: businessId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.taxRate !== undefined && { taxRate: input.taxRate }),
      ...(input.gcashQrUrl !== undefined && { gcashQrUrl: input.gcashQrUrl }),
      ...(input.mayaQrUrl !== undefined && { mayaQrUrl: input.mayaQrUrl }),
    },
    select: {
      id: true,
      name: true,
      taxRate: true,
      gcashQrUrl: true,
      mayaQrUrl: true,
      createdAt: true,
    },
  });
  return {
    id: updated.id,
    name: updated.name,
    taxRate: Number(updated.taxRate),
    gcashQrUrl: updated.gcashQrUrl,
    mayaQrUrl: updated.mayaQrUrl,
    createdAt: updated.createdAt,
  };
}

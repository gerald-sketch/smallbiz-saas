import { prisma } from "./prisma";

export type Plan = "FREE" | "STARTER" | "PRO";

export const PLAN_RANK: Record<Plan, number> = {
  FREE: 0,
  STARTER: 1,
  PRO: 2,
};

export interface PlanLimits {
  staff: number;
  products: number;
  canExportCsv: boolean;
  canViewProfitLoss: boolean;
  canViewTopProducts: boolean;
  canViewInventoryValuation: boolean;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: {
    staff: 1,
    products: 50,
    canExportCsv: false,
    canViewProfitLoss: false,
    canViewTopProducts: false,
    canViewInventoryValuation: false,
  },
  STARTER: {
    staff: 5,
    products: 500,
    canExportCsv: false,
    canViewProfitLoss: true,
    canViewTopProducts: true,
    canViewInventoryValuation: true,
  },
  PRO: {
    staff: Infinity,
    products: Infinity,
    canExportCsv: true,
    canViewProfitLoss: true,
    canViewTopProducts: true,
    canViewInventoryValuation: true,
  },
};

export function planAtLeast(current: Plan, required: Plan): boolean {
  return PLAN_RANK[current] >= PLAN_RANK[required];
}

/**
 * Look up the effective plan for a business.
 * Only ACTIVE subscriptions count — PENDING/CANCELED/EXPIRED fall back to FREE.
 */
export async function getBusinessPlan(businessId: string): Promise<Plan> {
  const sub = await prisma.subscription.findUnique({
    where: { businessId },
    select: { plan: true, status: true },
  });
  if (!sub || sub.status !== "ACTIVE") return "FREE";
  return sub.plan as Plan;
}

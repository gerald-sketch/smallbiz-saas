import axios from "axios";

export type Plan = "FREE" | "STARTER" | "PRO";

export function planAtLeast(current: Plan, required: Plan): boolean {
  const rank: Record<Plan, number> = { FREE: 0, STARTER: 1, PRO: 2 };
  return rank[current] >= rank[required];
}

/**
 * Detect plan-gate errors so the UI can show an upgrade prompt
 * instead of a generic toast.
 */
export function detectPlanError(
  e: unknown,
): { requiredPlan: Plan; message: string } | null {
  if (axios.isAxiosError(e)) {
    const data = e.response?.data as
      | {
          error?: string;
          message?: string;
          meta?: { requiredPlan?: Plan };
        }
      | undefined;

    if (
      data?.error === "PLAN_REQUIRED" ||
      data?.error === "PLAN_LIMIT_REACHED"
    ) {
      return {
        requiredPlan: data.meta?.requiredPlan ?? "STARTER",
        message: data.message ?? "This feature requires a higher plan.",
      };
    }
  }
  return null;
}

export const PLAN_LABEL: Record<Plan, string> = {
  FREE: "Free",
  STARTER: "Starter",
  PRO: "Pro",
};

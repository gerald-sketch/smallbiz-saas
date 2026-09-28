import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type Plan = "FREE" | "STARTER" | "PRO";
export type SubscriptionStatus =
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "EXPIRED"
  | "PENDING";

export interface BillingStatus {
  plan: Plan;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  autoRenew: boolean;
  priceCentavos: number;
  pricePesos: number;
}

export function useBillingStatus() {
  return useQuery({
    queryKey: ["billing", "status"],
    queryFn: async () => (await api.get<BillingStatus>("/billing/status")).data,
  });
}

export function useCreateCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (plan: "STARTER" | "PRO") =>
      (
        await api.post<{ checkoutId: string; checkoutUrl: string }>(
          "/billing/checkout",
          { plan },
        )
      ).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["billing"] }),
  });
}

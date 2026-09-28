import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type Role = "OWNER" | "MANAGER" | "STAFF";

export interface StaffSummary {
  id: string;
  name: string;
  email: string;
  role: Role;
  salesCount: number;
  revenue: number;
  avgSale: number;
  todayCount: number;
  todayRevenue: number;
  mtdCount: number;
  mtdRevenue: number;
  lastSaleAt: string | null;
}

export interface StaffDetail {
  staff: StaffSummary & {
    joinedAt: string;
  };
  daily14d: { day: string; total: number; count: number }[];
  topProducts: {
    productId: string;
    name: string;
    sku: string;
    unitsSold: number;
    revenue: number;
  }[];
  recentSales: {
    id: string;
    total: number;
    paymentMethod: string;
    paidAt: string;
    customerName: string;
  }[];
  paymentBreakdown: {
    method: string;
    count: number;
    total: number;
  }[];
}

export function useStaffOverview() {
  return useQuery({
    queryKey: ["dashboard", "staff"],
    queryFn: async () =>
      (await api.get<{ staff: StaffSummary[] }>("/dashboard/staff")).data.staff,
    staleTime: 30_000,
  });
}

export function useStaffDetail(userId: string | null) {
  return useQuery({
    queryKey: ["dashboard", "staff", userId],
    queryFn: async () =>
      (await api.get<StaffDetail>(`/dashboard/staff/${userId}`)).data,
    enabled: !!userId,
  });
}

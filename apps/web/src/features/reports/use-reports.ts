import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface SalesSummaryRow {
  period: string;
  salesCount: number;
  subtotal: number;
  discount: number;
  total: number;
}

export interface SalesSummaryData {
  rows: SalesSummaryRow[];
  totalSales: number;
  grandTotal: number;
}

export interface ProfitLossData {
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMargin: number;
  expenses: number;
  netProfit: number;
  netMargin: number;
}

export interface InventoryItem {
  productId: string;
  name: string;
  sku: string;
  stock: number;
  cost: number;
  costValue: number;
  retailValue: number;
}

export interface InventoryValuationData {
  itemCount: number;
  totalUnits: number;
  totalCostValue: number;
  totalRetailValue: number;
  potentialProfit: number;
  items: InventoryItem[];
}

export interface TopProductRow {
  productId: string;
  name: string;
  sku: string;
  unitsSold: number;
  revenue: number;
}

export interface TopProductsData {
  rows: TopProductRow[];
}

export function useSalesSummary(groupBy: "day" | "week" | "month") {
  return useQuery<SalesSummaryData>({
    queryKey: ["reports", "sales-summary", groupBy],
    queryFn: async () =>
      (await api.get(`/reports/sales-summary?groupBy=${groupBy}`))
        .data as SalesSummaryData,
  });
}

export function useProfitLoss(enabled = true) {
  return useQuery<ProfitLossData>({
    queryKey: ["reports", "profit-loss"],
    queryFn: async () =>
      (await api.get("/reports/profit-loss")).data as ProfitLossData,
    enabled,
  });
}

export function useInventoryValuation(enabled = true) {
  return useQuery<InventoryValuationData>({
    queryKey: ["reports", "inventory-valuation"],
    queryFn: async () =>
      (await api.get("/reports/inventory-valuation"))
        .data as InventoryValuationData,
    enabled,
  });
}

export function useTopProducts(enabled = true) {
  return useQuery<TopProductsData>({
    queryKey: ["reports", "top-products"],
    queryFn: async () =>
      (await api.get("/reports/top-products?limit=10")).data as TopProductsData,
    enabled,
  });
}

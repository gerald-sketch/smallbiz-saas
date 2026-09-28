import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Product } from "@/features/products/use-products";

export interface LowStockResponse {
  items: Product[];
  threshold: number;
}

export interface AdjustInput {
  productId: string;
  delta: number;
  reason: string;
}

export interface StockInInput {
  productId: string;
  quantity: number;
  reason?: string;
}

export interface StockOutInput {
  productId: string;
  quantity: number;
  reason?: string;
}

export interface AdjustResult {
  product: Product;
  previous: number;
  delta: number;
}

export function useLowStock(threshold = 5) {
  return useQuery({
    queryKey: ["inventory", "low-stock", threshold],
    queryFn: async () =>
      (
        await api.get<LowStockResponse>(
          `/inventory/low-stock?threshold=${threshold}`,
        )
      ).data,
  });
}

export function useProductsForInventory(search: string, categoryId?: string) {
  return useQuery({
    queryKey: ["inventory", "products", search, categoryId ?? "all"],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "500" });
      if (search) params.set("search", search);
      if (categoryId) params.set("categoryId", categoryId);
      const res = await api.get<{ items: Product[] }>(
        `/products?${params.toString()}`,
      );
      return res.data.items;
    },
    staleTime: 0,
  });
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["inventory"] });
  qc.invalidateQueries({ queryKey: ["products"] });
  qc.invalidateQueries({ queryKey: ["dashboard"] });
}

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: AdjustInput) =>
      (await api.post<AdjustResult>("/inventory/adjust", input)).data,
    onSuccess: () => invalidateAll(qc),
  });
}

export function useStockIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: StockInInput) =>
      (await api.post<AdjustResult>("/inventory/stock-in", input)).data,
    onSuccess: () => invalidateAll(qc),
  });
}

export function useStockOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: StockOutInput) =>
      (await api.post<AdjustResult>("/inventory/stock-out", input)).data,
    onSuccess: () => invalidateAll(qc),
  });
}

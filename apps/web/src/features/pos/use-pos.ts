import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Product } from "@/features/products/use-products";

export type PaymentMethod = "CASH" | "GCASH" | "MAYA";

export interface CartLine {
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  stock: number;
}

export interface SaleItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
}

export interface Sale {
  id: string;
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
  amountTendered: string | null;
  changeDue: string | null;
  paymentMethod: PaymentMethod;
  paymentReference: string | null;
  paidAt: string;
  items: SaleItem[];
  customer?: { id: string; name: string } | null;
}

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

export interface CheckoutInput {
  items: { productId: string; quantity: number }[];
  customerId?: string;
  discount: number;
  paymentMethod: PaymentMethod;
  amountTendered?: number;
  paymentReference?: string;
}

export function useProductSearch(search: string, categoryId?: string) {
  return useQuery({
    queryKey: ["pos", "products", search, categoryId ?? "all"],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "200" });
      if (search) params.set("search", search);
      if (categoryId) params.set("categoryId", categoryId);
      const res = await api.get<{ items: Product[] }>(
        `/products?${params.toString()}`,
      );
      return res.data.items.filter((p) => p.status === "ACTIVE");
    },
    staleTime: 0,
  });
}

export function useCustomerSearch(search: string) {
  return useQuery({
    queryKey: ["pos", "customers", search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await api.get<{ items: Customer[] }>(
        `/customers?${params.toString()}`,
      );
      return res.data.items;
    },
  });
}

export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CheckoutInput) => {
      const res = await api.post<Sale>("/pos/checkout", input);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["reports"] });
      qc.invalidateQueries({ queryKey: ["pos", "products"] });
    },
  });
}

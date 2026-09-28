import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Supplier {
  id: string;
  name: string;
  contact: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
}

export interface SupplierInput {
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export function useSuppliers(search: string) {
  return useQuery({
    queryKey: ["suppliers", { search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await api.get<{ items: Supplier[] }>(
        `/suppliers?${params.toString()}`,
      );
      return res.data.items;
    },
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SupplierInput) =>
      (await api.post<Supplier>("/suppliers", input)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}

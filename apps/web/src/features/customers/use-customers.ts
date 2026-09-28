import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  loyaltyPoints: number;
  createdAt: string;
  deletedAt: string | null;
}

export interface CustomerInput {
  name: string;
  email?: string;
  phone?: string;
}

export function useCustomers(search: string) {
  return useQuery({
    queryKey: ["customers", { search }],
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

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CustomerInput) =>
      (await api.post<Customer>("/customers", input)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: string;
  spentAt: string;
  createdAt: string;
}

export interface ExpenseInput {
  category: string;
  description: string;
  amount: number;
  spentAt?: string;
}

export interface ExpenseSummary {
  year: number;
  month: number;
  total: number;
  byCategory: { category: string; total: number; count: number }[];
}

export function useExpenses(page: number, category?: string) {
  return useQuery({
    queryKey: ["expenses", { page, category }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (category) params.set("category", category);
      const res = await api.get<{
        items: Expense[];
        total: number;
        page: number;
        pages: number;
      }>(`/expenses?${params.toString()}`);
      return res.data;
    },
  });
}

export function useExpenseSummary() {
  return useQuery({
    queryKey: ["expenses", "summary"],
    queryFn: async () =>
      (await api.get<ExpenseSummary>("/expenses/summary")).data,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ExpenseInput) =>
      (await api.post<Expense>("/expenses", input)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/expenses/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface BusinessProfile {
  id: string;
  name: string;
  taxRate: number;
  gcashQrUrl: string | null;
  mayaQrUrl: string | null;
  createdAt: string;
}

export function useBusinessProfile() {
  return useQuery({
    queryKey: ["settings", "profile"],
    queryFn: async () => (await api.get<BusinessProfile>("/settings")).data,
  });
}

export function useUpdateBusinessProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name?: string;
      taxRate?: number;
      gcashQrUrl?: string | null;
      mayaQrUrl?: string | null;
    }) => (await api.patch<BusinessProfile>("/settings/business", input)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

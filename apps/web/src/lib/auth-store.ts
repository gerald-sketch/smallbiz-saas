import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setAccessToken } from "./api";

export type Role = "OWNER" | "MANAGER" | "STAFF";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  businessId: string;
  businessName: string;
}

interface AuthState {
  user: AuthUser | null;
  setSession: (user: AuthUser, token: string) => void;
  clear: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setSession: (user, token) => {
        setAccessToken(token);
        set({ user });
      },
      clear: () => {
        setAccessToken(null);
        set({ user: null });
      },
    }),
    {
      name: "sb-auth",
      partialize: (s) => ({ user: s.user }),
    },
  ),
);

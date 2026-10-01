import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth, AuthUser } from "@/lib/auth-store";

interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export function useLogin() {
  const { setSession } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const res = await api.post<AuthResponse>("/auth/login", input);
      return res.data;
    },
    onSuccess: (data) => {
      setSession(data.user, data.accessToken);
      navigate("/dashboard");
    },
  });
}

export function useRegister() {
  const { setSession } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (input: {
      businessName: string;
      name: string;
      email: string;
      password: string;
    }) => {
      const res = await api.post<AuthResponse>("/auth/register", input);
      return res.data;
    },
    onSuccess: (data) => {
      setSession(data.user, data.accessToken);
      navigate("/dashboard");
    },
  });
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch {
    // ignore
  }
  useAuth.getState().clear();
}

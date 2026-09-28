import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const apiBaseUrl =
  (import.meta as ImportMeta & { env: { VITE_API_URL?: string } }).env
    .VITE_API_URL ?? "/api";

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  const method = config.method?.toLowerCase();
  if (method && ["post", "patch", "put", "delete"].includes(method)) {
    if (!config.headers["Idempotency-Key"]) {
      config.headers["Idempotency-Key"] = crypto.randomUUID();
    }
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  try {
    const res = await axios.post(
      `${apiBaseUrl}/auth/refresh`,
      {},
      { withCredentials: true },
    );
    const token = res.data?.accessToken ?? null;
    setAccessToken(token);
    return token;
  } catch {
    setAccessToken(null);
    return null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const status = error.response?.status;
    const url = original?.url ?? "";

    if (status === 401 && !original._retry && !url.includes("/auth/")) {
      original._retry = true;
      refreshing ??= doRefresh().finally(() => {
        refreshing = null;
      });
      const token = await refreshing;
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export function apiErrorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const data = e.response?.data as
      | { message?: string; error?: string }
      | undefined;
    return data?.message ?? data?.error ?? e.message;
  }
  return e instanceof Error ? e.message : "Something went wrong";
}

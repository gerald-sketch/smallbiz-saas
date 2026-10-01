import { Navigate, Outlet } from "react-router-dom";
import { useAuth, type Role } from "@/lib/auth-store";

export function RequireRole({ roles }: { roles: Role[] }) {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

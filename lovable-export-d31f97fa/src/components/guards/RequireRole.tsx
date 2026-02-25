import { Navigate } from "react-router-dom";
import { useAuth, type UserRole } from "@/contexts/AuthContext";

export function RequireRole({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    const fallback = user.role === "admin" ? "/admin" : "/app";
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}

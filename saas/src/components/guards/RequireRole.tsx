import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type UserRole } from "@/contexts/AuthContext";

export function RequireRole({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  // Allow demo mode bypass via ?demo= query param
  const searchParams = new URLSearchParams(location.search);
  const isDemo = searchParams.has("demo");

  if (isDemo) {
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    const fallback = user.role === "admin" ? "/admin" : "/app";
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}

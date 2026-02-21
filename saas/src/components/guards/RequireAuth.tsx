import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Allow demo mode bypass via ?demo= query param
  const searchParams = new URLSearchParams(location.search);
  const isDemo = searchParams.has("demo");

  if (isDemo) {
    return <>{children}</>;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
}

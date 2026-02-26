import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { type UserRole } from "@/lib/api/auth";

export function RequireRole({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  console.log(`[Security Guard] Checking access to ${role} required route. Current user role: ${user?.role}`);

  if (user.role !== role) {
    console.warn(`[Security Guard] Access denied! User role ${user.role} is not ${role}. Redirecting...`);
    const fallback = user.role === "admin" ? "/admin" : "/app";
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}

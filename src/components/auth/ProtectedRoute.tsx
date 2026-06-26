import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/lib/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** When set, the user must hold this exact role or they are redirected. */
  requiredRole?: UserRole;
}

/** Full-screen centered spinner shown while the session is hydrating. */
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
);

/**
 * Guards a route so only authenticated users (optionally of a specific role)
 * can reach it. Renders a spinner during hydration to avoid a flash of
 * redirect, sends signed-out users to `/login`, and sends users lacking the
 * required role back to `/`.
 */
const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (user === null) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

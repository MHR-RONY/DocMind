import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface PublicRouteProps {
  children: React.ReactNode;
}

/** Full-screen centered spinner shown while the session is hydrating. */
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
);

/**
 * Guards routes that only signed-out users should see (login, signup). Renders
 * a spinner during hydration, then redirects already-authenticated users to
 * the app home so they don't land back on the auth screens.
 */
const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (user !== null) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;

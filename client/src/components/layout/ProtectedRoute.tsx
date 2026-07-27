import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

function AuthLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)]" />
    </div>
  );
}

export function getRoleHomePath(role: "SEEKER" | "REFERRER" | null | undefined) {
  if (role === "SEEKER") return "/seeker";
  if (role === "REFERRER") return "/referrer";
  return "/";
}

interface GuestRouteProps {
  children: React.ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { user, isInitialized, isLoading } = useAuthStore();

  if (!isInitialized || isLoading) {
    return <AuthLoading />;
  }

  if (user?.role) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  return <>{children}</>;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: "SEEKER" | "REFERRER";
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, isInitialized, isLoading } = useAuthStore();
  const location = useLocation();

  if (!isInitialized || isLoading) {
    return <AuthLoading />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  return <>{children}</>;
}

import { Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";
import { PageTransition } from "../components/layout/PageTransition";
import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";
import { getRoleHomePath } from "../components/layout/ProtectedRoute";
import { useAuthStore } from "../stores/authStore";

export default function NotFound() {
  const { user } = useAuthStore();
  const homePath = getRoleHomePath(user?.role);

  return (
    <PageTransition className="gradient-bg flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <GlassCard padding="lg" className="max-w-md w-full text-center">
        <FileQuestion className="mx-auto h-12 w-12 text-accent mb-4" />
        <h1 className="text-2xl font-semibold text-theme">Page not found</h1>
        <p className="mt-2 text-sm text-muted">
          The page you’re looking for doesn’t exist or may have been moved.
        </p>
        <Link to={homePath} className="inline-block mt-6">
          <Button>{user ? "Go to dashboard" : "Back to home"}</Button>
        </Link>
      </GlassCard>
    </PageTransition>
  );
}

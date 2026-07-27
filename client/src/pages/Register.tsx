import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/layout/AuthLayout";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { api } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { cn } from "../lib/utils";

export default function Register() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") === "referrer" ? "REFERRER" : searchParams.get("role") === "seeker" ? "SEEKER" : null;
  const [role, setRole] = useState<"SEEKER" | "REFERRER" | null>(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setToken, setMe } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) { setError("Please select a role"); return; }
    setError("");
    setIsLoading(true);
    try {
      const data = await api.register(email, password, role);
      setToken(data.accessToken);
      setUser(data.user);
      const me = await api.getMe();
      setMe(me);
      navigate(role === "SEEKER" ? "/seeker/onboarding" : "/referrer/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Join Refer Me and start connecting">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-500" role="alert">{error}</div>
        )}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-muted">I am a...</label>
          <div className="grid grid-cols-2 gap-3">
            {(["SEEKER", "REFERRER"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  "rounded-xl border px-4 py-3 text-sm font-medium transition-all",
                  role === r
                    ? "border-[var(--color-accent)]/50 bg-[var(--color-accent-muted)] text-accent"
                    : "border-theme text-muted hover:opacity-80"
                )}
                style={role !== r ? { backgroundColor: "var(--color-input-bg)" } : undefined}
              >
                {r === "SEEKER" ? "Job Seeker" : "Referrer"}
              </button>
            ))}
          </div>
        </div>
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
        <Button type="submit" className="w-full" isLoading={isLoading}>Create account</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="text-accent hover:opacity-80">Sign in</Link>
      </p>
    </AuthLayout>
  );
}

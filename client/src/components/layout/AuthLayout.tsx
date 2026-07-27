import { Link } from "react-router-dom";
import { PageTransition } from "./PageTransition";
import { Logo } from "../ui/Logo";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <PageTransition className="gradient-bg min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex justify-center mb-6">
            <Logo size="md" />
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-theme">{title}</h1>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
        </div>
        <div className="glass rounded-2xl p-8">{children}</div>
      </div>
    </PageTransition>
  );
}

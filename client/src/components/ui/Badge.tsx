import { cn } from "../../lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "green" | "purple" | "cyan" | "yellow" | "red";
  className?: string;
}

const variants = {
  default: "bg-[var(--color-elevated)] text-muted border border-theme",
  green: "bg-[var(--color-accent-muted)] text-[var(--color-accent)]",
  purple: "bg-purple-500/15 text-purple-400",
  cyan: "bg-cyan-500/15 text-cyan-500",
  yellow: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  red: "bg-red-500/15 text-red-500",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}

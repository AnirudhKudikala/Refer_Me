import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";
import { cardHover } from "../../lib/motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

const paddingMap = { sm: "p-4", md: "p-6", lg: "p-8" };

export function GlassCard({ className, hover = false, padding = "md", children, ...props }: GlassCardProps) {
  const Component = hover ? motion.div : motion.div;
  return (
    <Component
      className={cn("glass rounded-2xl", paddingMap[padding], className)}
      {...(hover ? { variants: cardHover, initial: "rest", whileHover: "hover" } : {})}
      {...props}
    >
      {children}
    </Component>
  );
}

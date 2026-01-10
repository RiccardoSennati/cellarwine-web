import { cn } from "@/lib/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "readiness" | "rating" | "default";
  className?: string;
}

const variantStyles = {
  readiness: "bg-[var(--accent-muted)] text-[var(--accent-primary)] border-[var(--accent-primary)]",
  rating: "bg-[var(--surface-elevated)] text-[var(--text-primary)] border-[var(--border-default)]",
  default: "bg-[var(--surface-base)] text-[var(--text-secondary)] border-[var(--border-default)]",
};

export function Badge({ 
  children, 
  variant = "default",
  className 
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        "border backdrop-blur-[var(--glass-blur)]",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}


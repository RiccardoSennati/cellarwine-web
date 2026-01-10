import { cn } from "@/lib/cn";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface GlassChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  children: React.ReactNode;
}

export const GlassChip = forwardRef<HTMLButtonElement, GlassChipProps>(
  ({ className, selected = false, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "rounded-full px-4 py-1.5 text-sm font-medium",
          "backdrop-blur-[var(--glass-blur)]",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]",
          selected
            ? "bg-[var(--accent-primary)] text-white border border-[var(--accent-primary)]"
            : "bg-[var(--surface-base)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

GlassChip.displayName = "GlassChip";


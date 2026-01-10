import { cn } from "@/lib/cn";
import { type InputHTMLAttributes, forwardRef } from "react";

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, label, error, disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full rounded-lg px-4 py-2",
            "bg-[var(--surface-base)] border border-[var(--border-default)]",
            "backdrop-blur-[var(--glass-blur)]",
            "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-[var(--accent-primary)]",
            className
          )}
          disabled={disabled}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-[var(--accent-primary)]">{error}</p>
        )}
      </div>
    );
  }
);

GlassInput.displayName = "GlassInput";


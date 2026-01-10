import { cn } from "@/lib/cn";
import { type TextareaHTMLAttributes, forwardRef } from "react";

interface GlassTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  ({ className, label, error, disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full rounded-lg px-4 py-2 min-h-[100px] resize-y",
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

GlassTextarea.displayName = "GlassTextarea";


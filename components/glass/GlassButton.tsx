import { cn } from "@/lib/cn";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "destructive";
    size?: "sm" | "md" | "lg";
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
    ({
        className,
        variant = "primary",
        size = "md",
        disabled,
        ...props
    }, ref) => {
        const variantStyles = {
            primary: "bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)] text-white",
            secondary: "bg-[var(--surface-base)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-[var(--text-primary)]",
            destructive: "bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)] text-white",
        };

        const sizeStyles = {
            sm: "px-3 py-1.5 text-sm",
            md: "px-4 py-2 text-base",
            lg: "px-6 py-3 text-lg",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "rounded-lg font-medium",
                    "backdrop-blur-[var(--glass-blur)]",
                    "transition-colors duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
                    variantStyles[variant],
                    sizeStyles[size],
                    className
                )}
                disabled={disabled}
                {...props}
            />
        );
    }
);

GlassButton.displayName = "GlassButton";


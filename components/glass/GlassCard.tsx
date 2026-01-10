import { cn } from "@/lib/cn";
import { type ReactNode } from "react";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    variant?: "default" | "elevated";
}

export function GlassCard({
    children,
    className,
    variant = "default"
}: GlassCardProps) {
    const surfaceColor = variant === "elevated"
        ? "bg-[var(--surface-elevated)]"
        : "bg-[var(--surface-base)]";

    return (
        <div
            className={cn(
                "rounded-lg border border-[var(--border-default)]",
                "backdrop-blur-[var(--glass-blur)]",
                surfaceColor,
                "p-6",
                className
            )}
        >
            {children}
        </div>
    );
}


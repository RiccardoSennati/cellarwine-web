import { cn } from "@/lib/cn";
import { type ReactNode } from "react";

interface GlassBackgroundProps {
    children: ReactNode;
    className?: string;
}

export function GlassBackground({ children, className }: GlassBackgroundProps) {
    return (
        <div
            className={cn(
                "min-h-screen w-full",
                "bg-[var(--bg-primary)]",
                className
            )}
        >
            {children}
        </div>
    );
}


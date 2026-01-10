import { cn } from "@/lib/cn";
import { type ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ 
  title, 
  subtitle, 
  action,
  className 
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between mb-6", className)}>
      <div>
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-[var(--text-secondary)]">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}


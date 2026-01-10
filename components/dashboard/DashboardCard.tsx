"use client";

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

interface DashboardCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
}

export function DashboardCard({ children, className, title, description, actions }: DashboardCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] shadow-[var(--shadow-sm)]",
        className
      )}
    >
      {(title || description || actions) && (
        <div className="flex items-start justify-between p-4 border-b border-[var(--border-default)]">
          <div className="flex-1">
            {title && (
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
            )}
            {description && (
              <p className="text-sm text-[var(--text-muted)]">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}


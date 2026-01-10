"use client";

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

interface DashboardTableProps {
  children: ReactNode;
  className?: string;
}

export function DashboardTable({ children, className }: DashboardTableProps) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] shadow-[var(--shadow-sm)]", className)}>
      <table className="w-full">
        {children}
      </table>
    </div>
  );
}

interface DashboardTableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function DashboardTableHeader({ children, className }: DashboardTableHeaderProps) {
  return (
    <thead className={cn("border-b border-[var(--border-default)] bg-[var(--surface-elevated)]", className)}>
      {children}
    </thead>
  );
}

interface DashboardTableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function DashboardTableRow({ children, className, onClick }: DashboardTableRowProps) {
  return (
    <tr
      className={cn(
        "border-b border-[var(--border-default)] transition-colors",
        onClick && "cursor-pointer hover:bg-[var(--surface-hover)]",
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface DashboardTableHeadProps {
  children: ReactNode;
  className?: string;
}

export function DashboardTableHead({ children, className }: DashboardTableHeadProps) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider",
        className
      )}
    >
      {children}
    </th>
  );
}

interface DashboardTableBodyProps {
  children: ReactNode;
  className?: string;
}

export function DashboardTableBody({ children, className }: DashboardTableBodyProps) {
  return <tbody className={cn("divide-y divide-[var(--border-default)]", className)}>{children}</tbody>;
}

interface DashboardTableCellProps {
  children: ReactNode;
  className?: string;
}

export function DashboardTableCell({ children, className }: DashboardTableCellProps) {
  return (
    <td className={cn("px-4 py-3 text-sm text-[var(--text-primary)]", className)}>{children}</td>
  );
}


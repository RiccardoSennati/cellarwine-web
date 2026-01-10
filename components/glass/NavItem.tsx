"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  collapsed?: boolean;
}

export function NavItem({ href, children, icon, className, onClick, collapsed }: NavItemProps) {
  const pathname = usePathname();
  // Per la route base "/app", attivo solo se pathname è esattamente "/app"
  // Per le altre route, attivo se pathname === href o inizia con "${href}/"
  const isActive =
    pathname === href ||
    (href !== "/app" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
        "transition-all duration-200",
        collapsed ? "justify-center" : "justify-start",
        isActive
          ? "bg-[var(--surface-selected)] text-[var(--text-primary)] border-l-2 border-[var(--accent-primary)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
        className
      )}
      title={collapsed ? children?.toString() : undefined}
    >
      {icon && <span className={cn("flex-shrink-0", collapsed && "")}>{icon}</span>}
      {!collapsed && <span>{children}</span>}
    </Link>
  );
}


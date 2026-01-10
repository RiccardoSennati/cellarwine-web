"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { NavItem } from "./NavItem";
import { GlassButton } from "./GlassButton";
import type { User } from "@supabase/supabase-js";
import { Menu, X, ChevronLeft, LogOut, LayoutDashboard, Package, UtensilsCrossed, BarChart3, Settings } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
  user?: User | null;
  pageTitle?: string;
  pageActions?: React.ReactNode;
}

const navigation = [
  { href: "/app", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/app/inventory", label: "Inventory", icon: <Package className="h-5 w-5" /> },
  { href: "/app/tastings", label: "Tastings", icon: <UtensilsCrossed className="h-5 w-5" /> },
  { href: "/app/stats", label: "Stats", icon: <BarChart3 className="h-5 w-5" /> },
  { href: "/app/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
];

const SIDEBAR_WIDTH = 256; // 64 in Tailwind (w-64)
const SIDEBAR_COLLAPSED_WIDTH = 64;

export function AppShell({ children, user, pageTitle, pageActions }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    const response = await fetch("/app/logout", {
      method: "POST",
    });
    if (response.ok) {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 transition-all duration-300 z-40",
          sidebarCollapsed ? "md:w-16" : "md:w-64"
        )}
      >
        <div className="flex flex-col flex-grow border-r border-[var(--border-default)] bg-[var(--surface-base)] shadow-[var(--shadow-sm)]">
          {/* Logo & Collapse Button */}
          <div className="flex items-center h-14 px-4 border-b border-[var(--border-default)]">
            {!sidebarCollapsed && (
              <Link href="/app" className="flex items-center gap-2 flex-1">
                <Package className="h-6 w-6 text-[var(--accent-primary)]" />
                <span className="text-base font-semibold text-[var(--text-primary)]">
                  CellarWine
                </span>
              </Link>
            )}
            {sidebarCollapsed && (
              <Link href="/app" className="flex items-center justify-center w-full">
                <Package className="h-6 w-6 text-[var(--accent-primary)]" />
              </Link>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors ml-auto"
              aria-label={sidebarCollapsed ? "Espandi sidebar" : "Comprimi sidebar"}
            >
              <ChevronLeft
                className={cn("h-4 w-4 transition-transform", sidebarCollapsed && "rotate-180")}
              />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
            {navigation.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                collapsed={sidebarCollapsed}
              >
                {item.label}
              </NavItem>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="p-3 border-t border-[var(--border-default)]">
            {!sidebarCollapsed && user && (
              <div className="mb-2 px-2">
                <p className="text-xs text-[var(--text-muted)] mb-1">Utente</p>
                <p className="text-sm text-[var(--text-primary)] truncate">
                  {user.email}
                </p>
              </div>
            )}
            <GlassButton
              variant="secondary"
              size="sm"
              className={cn("w-full", sidebarCollapsed && "px-2")}
              onClick={handleLogout}
              title={sidebarCollapsed ? "Logout" : undefined}
            >
              {sidebarCollapsed ? <LogOut className="h-4 w-4" /> : "Logout"}
            </GlassButton>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 transition-all duration-300",
          sidebarCollapsed ? "md:ml-16" : "md:ml-64"
        )}
      >
        {/* Topbar (Desktop & Mobile) */}
        <header className="sticky top-0 z-30 border-b border-[var(--border-default)] bg-[var(--surface-base)] shadow-[var(--shadow-sm)]">
          <div className="flex items-center h-14 px-4 md:px-6">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded hover:bg-[var(--surface-hover)] text-[var(--text-primary)] mr-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Page Title */}
            {pageTitle && (
              <h1 className="text-lg font-semibold text-[var(--text-primary)] flex-1">
                {pageTitle}
              </h1>
            )}

            {/* Page Actions */}
            {pageActions && <div className="flex items-center gap-2">{pageActions}</div>}
          </div>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-[var(--bg-primary)]">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between h-14 px-4 border-b border-[var(--border-default)]">
                <Link href="/app" className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-[var(--accent-primary)]" />
                  <span className="text-base font-semibold text-[var(--text-primary)]">
                    CellarWine
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded hover:bg-[var(--surface-hover)] text-[var(--text-primary)]"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    className="w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </NavItem>
                ))}
                {user && (
                  <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
                    <p className="text-xs text-[var(--text-muted)] mb-2 px-2">
                      {user.email}
                    </p>
                    <GlassButton
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={handleLogout}
                    >
                      Logout
                    </GlassButton>
                  </div>
                )}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className={cn("min-h-[calc(100vh-3.5rem)]", mobileMenuOpen && "hidden md:block")}>
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}


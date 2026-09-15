"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  Bell,
  ChevronRight,
  CircleHelp,
  LogOut,
  Menu,
  Search,
  Settings,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { ADMIN_NAV_GROUPS } from "@/lib/constants";
import { cn, timeAgo } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { AdminBrandMark } from "@/components/layout/AdminSidebar";

const ADMIN_NOTIF_ICON: Record<string, { icon: LucideIcon; className: string }> = {
  system_alert: { icon: AlertTriangle, className: "bg-red-50 text-red-600" },
  tenant_issue: { icon: Activity, className: "bg-amber-50 text-amber-600" },
  security: { icon: Shield, className: "bg-emerald-50 text-emerald-600" },
  info: { icon: Bell, className: "bg-slate-100 text-slate-600" },
};

const adminNotifications = [
  {
    id: "1",
    type: "system_alert",
    title: "High CPU Usage",
    message: "Server CPU usage exceeded 90% for 5 minutes",
    time: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    read: false,
    href: "/admin/health",
  },
  {
    id: "2",
    type: "tenant_issue",
    title: "Tenant Suspension",
    message: "Tenant ABC Corp has been auto-suspended due to payment failure",
    time: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    read: false,
    href: "/admin/tenants",
  },
  {
    id: "3",
    type: "security",
    title: "Security Alert",
    message: "Unusual login activity detected from IP 192.168.1.100",
    time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: true,
    href: "/admin/security",
  },
];

function getAdminPageTitle(pathname: string): string {
  if (pathname.startsWith("/admin/dashboard")) return "Dashboard";
  if (pathname.startsWith("/admin/health")) return "System Health";
  if (pathname.startsWith("/admin/tenants")) return "Tenant Management";
  if (pathname.startsWith("/admin/users")) return "User Management";
  if (pathname.startsWith("/admin/analytics")) return "Analytics";
  if (pathname.startsWith("/admin/settings")) return "Settings";
  
  const match = [...ADMIN_NAV_GROUPS.flatMap(g => g.items)]
    .sort((a, b) => b.href.length - a.href.length)
    .find((n) => pathname === n.href || pathname.startsWith(n.href + "/"));
  return match?.label ?? "Admin";
}

function getAdminSubTitle(pathname: string): string | null {
  const match = [...ADMIN_NAV_GROUPS.flatMap(g => g.items)]
    .sort((a, b) => b.href.length - a.href.length)
    .find((n) => pathname === n.href);
  return pathname === "/admin" ? null : match?.label ?? null;
}

export function AdminHeader({
  onMenuClick,
  onSearchClick,
  onSidebarToggle,
}: {
  onMenuClick: () => void;
  onSearchClick: () => void;
  onSidebarToggle?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const title = getAdminPageTitle(pathname);
  const sub = getAdminSubTitle(pathname);
  const unread = adminNotifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    toast.success("Logged out successfully", {
      description: "You have been logged out of the admin panel",
    });
    router.push("/auth/admin-login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-[60px] shrink-0 items-center gap-2 border-b border-slate-200 bg-white/90 pl-4 pr-3 backdrop-blur md:pl-6 md:pr-4">
      {/* Mobile brand + menu */}
      <button
        type="button"
        aria-label="Open navigation"
        onClick={onMenuClick}
        className="focus-ring -ml-1 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
      >
        <Menu className="size-5" />
      </button>
      <Link href="/admin/dashboard" className="lg:hidden" aria-label="Zimora Admin home">
        <AdminBrandMark className="h-10 w-auto" />
      </Link>

      {/* Desktop sidebar toggle */}
      {onSidebarToggle && (
        <button
          type="button"
          aria-label="Toggle sidebar"
          onClick={onSidebarToggle}
          className="focus-ring hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:block"
        >
          <Menu className="size-5" />
        </button>
      )}

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-[13px] md:flex">
        <Link href="/admin/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">
          Admin
        </Link>
        <ChevronRight className="size-3.5 shrink-0 text-slate-300" />
        <span className="truncate font-medium">{title}</span>
        {sub && (
          <>
            <ChevronRight className="size-3.5 shrink-0 text-slate-300" />
            <span className="truncate font-medium">{sub}</span>
          </>
        )}
      </nav>

      <div className="ml-auto flex items-center gap-1 md:gap-1.5">
        {/* Global search */}
        <button
          type="button"
          onClick={onSearchClick}
          className="focus-ring hidden h-9 items-center gap-2 rounded-lg border border-input bg-muted/50 pl-3 pr-2 text-[13px] text-muted-foreground shadow-sm transition-colors hover:bg-muted sm:flex sm:w-56 lg:w-64"
        >
          <Search className="size-3.5" />
          <span className="flex-1 text-left">Search tenants, users…</span>
          <kbd className="kbd">⌘K</kbd>
        </button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Search"
          onClick={onSearchClick}
          className="sm:hidden"
        >
          <Search />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Notifications (${unread} unread)`} className="relative">
              <Bell />
              {unread > 0 && (
                <span
                  aria-hidden
                  className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white"
                >
                  {unread}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[min(92vw,360px)] p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-[13px] font-semibold">Admin Notifications</p>
              <button
                className="text-xs font-medium text-primary hover:underline focus-ring rounded"
                onClick={() => toast.success("All notifications marked as read")}
              >
                Mark all read
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto py-1">
              {adminNotifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                adminNotifications.slice(0, 5).map((n) => {
                  const meta = ADMIN_NOTIF_ICON[n.type] || ADMIN_NOTIF_ICON.info;
                  const Icon = meta.icon;
                  return (
                    <Link
                      key={n.id}
                      href={n.href ?? "/admin/notifications"}
                      className={cn(
                        "flex gap-3 px-4 py-2.5 transition-colors hover:bg-muted/60",
                        !n.read && "bg-primary/[0.035]"
                      )}
                    >
                      <span className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg", meta.className)}>
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-medium leading-snug">{n.title}</span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{n.message}</span>
                        <span className="mt-0.5 block text-[11px] text-muted-foreground/80">{timeAgo(n.time)}</span>
                      </span>
                      {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                    </Link>
                  );
                })
              )}
            </div>
            <Link
              href="/admin/notifications"
              className="block border-t border-border px-4 py-2.5 text-center text-[13px] font-medium text-primary hover:bg-muted/40 focus-ring"
            >
              View all notifications
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus-ring flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-1.5 transition-colors hover:bg-slate-100 md:pr-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                <span className="text-sm font-semibold text-primary">SA</span>
              </div>
              <span className="hidden min-w-0 text-left lg:block">
                <span className="block max-w-[140px] truncate text-[13px] font-semibold leading-tight">
                  Super Admin
                </span>
                <span className="block text-[11px] leading-tight text-muted-foreground">System Administrator</span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2.5 py-2">
              <p className="text-[13px] font-semibold">Super Admin</p>
              <p className="truncate text-xs text-muted-foreground">admin@zimora.com</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => router.push("/admin/settings")}>
              <Settings /> Admin Settings
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push("/admin/security")}>
              <Shield /> Security
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push("/help")}>
              <CircleHelp /> Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onSelect={handleLogout}>
              <LogOut /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

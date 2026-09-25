"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Info,
  LogOut,
  Menu,
  Moon,
  RotateCcw,
  Search,
  Settings,
  Sun,
  UserPlus,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { getPageTitle, SETTINGS_NAV, currentUser, notifications as seedNotifications } from "@/lib/constants";
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
import { BrandMark } from "@/components/layout/SidebarNav";
import { useTheme } from "@/lib/contexts/ThemeContext";

// Routes that should always be in light mode
const LIGHT_MODE_ROUTES = ["/", "/privacy-policy", "/terms-of-use"];

const NOTIF_ICON: Record<string, { icon: LucideIcon; className: string }> = {
  low_stock: { icon: AlertTriangle, className: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400" },
  payment: { icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" },
  failed_payment: { icon: XCircle, className: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400" },
  refund: { icon: RotateCcw, className: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400" },
  employee: { icon: UserPlus, className: "bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400" },
  subscription: { icon: CreditCard, className: "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400" },
  system: { icon: Info, className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
};

function settingsSubTitle(pathname: string): string | null {
  const match = [...SETTINGS_NAV]
    .sort((a, b) => b.href.length - a.href.length)
    .find((n) => pathname === n.href);
  return pathname === "/settings" ? null : match?.label ?? null;
}

export function TopHeader({
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
  const title = getPageTitle(pathname);
  const sub = pathname.startsWith("/settings") ? settingsSubTitle(pathname) : null;
  const unread = seedNotifications.filter((n) => !n.read).length;
  const { theme, toggleTheme } = useTheme();

  // Check if current route should be in light mode
  const isLightModeRoute = LIGHT_MODE_ROUTES.includes(pathname);

  // Handle empty user data
  const userName = currentUser.name || "User";
  const userEmail = currentUser.email || "user@example.com";
  const userRole = currentUser.role || "Owner";

  return (
    <header className="sticky top-0 z-30 flex h-[56px] sm:h-[60px] shrink-0 items-center gap-2 border-b border-slate-200 bg-white/90 pl-3 sm:pl-4 pr-2 sm:pr-3 backdrop-blur md:pl-6 md:pr-4 dark:border-border dark:bg-background/90">
      {/* Mobile brand + menu */}
      <button
        type="button"
        aria-label="Open navigation"
        onClick={onMenuClick}
        className="focus-ring -ml-1 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-muted-foreground dark:hover:bg-muted"
      >
        <Menu className="size-5" />
      </button>
      <Link href="/dashboard" className="lg:hidden" aria-label="Zimora Cloud POS home">
        <BrandMark className="h-8 sm:h-10 w-auto" />
      </Link>

      {/* Desktop sidebar toggle */}
      {onSidebarToggle && (
        <button
          type="button"
          aria-label="Toggle sidebar"
          onClick={onSidebarToggle}
          className="focus-ring hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:block dark:text-muted-foreground dark:hover:bg-muted"
        >
          <Menu className="size-5" />
        </button>
      )}

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-[13px] md:flex">
        <Link href="/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-3.5 shrink-0 text-slate-300 dark:text-muted-foreground/50" />
        <span className="truncate font-medium">{title}</span>
        {sub && (
          <>
            <ChevronRight className="size-3.5 shrink-0 text-slate-300 dark:text-muted-foreground/50" />
            <span className="truncate font-medium">{sub}</span>
          </>
        )}
      </nav>

      <div className="ml-auto flex items-center gap-1 md:gap-1.5">
        {/* Global search */}
        <button
          type="button"
          onClick={onSearchClick}
          className="focus-ring hidden h-9 items-center gap-2 rounded-lg border border-input bg-muted/50 pl-3 pr-2 text-[13px] text-muted-foreground shadow-sm transition-colors hover:bg-muted sm:flex sm:w-48 md:w-56 lg:w-64"
        >
          <Search className="size-3.5" />
          <span className="flex-1 text-left">Search…</span>
          <kbd className="kbd hidden sm:inline-block">⌘K</kbd>
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

        {/* Theme toggle - hide on light mode routes */}
        {!isLightModeRoute && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="focus-ring"
          >
            {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </Button>
        )}

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Notifications (${unread} unread)`} className="relative">
              <Bell />
              {unread > 0 && (
                <span
                  aria-hidden
                  className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-background"
                >
                  {unread}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[min(92vw,360px)] p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-[13px] font-semibold">Notifications</p>
              <button
                className="text-xs font-medium text-primary hover:underline focus-ring rounded"
                onClick={() => toast.success("All notifications marked as read")}
              >
                Mark all read
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto py-1">
              {seedNotifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                seedNotifications.slice(0, 5).map((n) => {
                  const meta = NOTIF_ICON[n.type] || NOTIF_ICON.system;
                  const Icon = meta.icon;
                  return (
                    <Link
                      key={n.id}
                      href={n.href ?? "/notifications"}
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
              href="/notifications"
              className="block border-t border-border px-4 py-2.5 text-center text-[13px] font-medium text-primary hover:bg-muted/40 focus-ring"
            >
              View all notifications
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus-ring flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-1.5 transition-colors hover:bg-slate-100 md:pr-2 dark:hover:bg-muted">
              <Avatar name={userName} size={8} />
              <span className="hidden min-w-0 text-left lg:block">
                <span className="block max-w-[140px] truncate text-[13px] font-semibold leading-tight">
                  {userName}
                </span>
                <span className="block text-[11px] leading-tight text-muted-foreground">{userRole}</span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2.5 py-2">
              <p className="text-[13px] font-semibold">{userName}</p>
              <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => (window.location.href = "/settings/business")}>
              <Avatar name={userName} className="size-4 text-[8px]" size={4} /> Account
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => (window.location.href = "/settings")}>
              <Settings /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => (window.location.href = "/help")}
            >
              <CircleHelp /> Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              destructive
              onSelect={() => {
                toast.info("Signed out (demo)", {
                  description: "Authentication is stubbed in this prototype.",
                });
                router.push("/");
              }}
            >
              <LogOut /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

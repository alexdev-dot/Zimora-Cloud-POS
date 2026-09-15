"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_GROUPS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/misc";

export function AdminBrandMark({ className, collapsed = false }: { className?: string; collapsed?: boolean }) {
  return (
    <Image
      src="/logo.png"
      alt="Zimora Cloud POS"
      width={558}
      height={447}
      className={cn(
        "shrink-0 object-contain transition-all duration-300",
        collapsed ? "h-8 w-auto" : "h-12 w-auto",
        className
      )}
    />
  );
}

export function AdminSidebarNav({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin/dashboard" || href === "/admin/tenants" || href === "/admin/users"
      ? pathname === href || pathname.startsWith(href + "/")
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav aria-label="Admin navigation" className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4 pb-8">
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <p className="mb-1.5 px-2.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">
                {group.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                const linkContent = (
                  <>
                    <Icon
                      className={cn(
                        "size-[17px] shrink-0",
                        active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-slate-700"
                      )}
                    />
                    {!collapsed && item.label}
                    {!collapsed && item.href === "/admin/notifications" && (
                      <span className="ml-auto flex size-4.5 min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        3
                      </span>
                    )}
                  </>
                );

                return (
                  <li key={item.href}>
                    {collapsed ? (
                      <Tooltip label={item.label} side="right">
                        <Link
                          href={item.href}
                          onClick={onNavigate}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium outline-none transition-colors focus-ring",
                            collapsed ? "justify-center px-2" : "",
                            active
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          )}
                        >
                          {linkContent}
                        </Link>
                      </Tooltip>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium outline-none transition-colors focus-ring",
                          collapsed ? "justify-center px-2" : "",
                          active
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        {linkContent}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Admin Profile Section */}
      {!collapsed && (
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
              <span className="text-sm font-semibold text-primary">SA</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Super Admin</p>
              <p className="text-xs text-muted-foreground truncate">admin@zimora.com</p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

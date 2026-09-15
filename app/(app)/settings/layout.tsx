"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SETTINGS_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="page">
      <div className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight md:text-[22px]">Settings</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Configure your workspace, business profile and integrations
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
        {/* Secondary navigation */}
        <aside className="lg:sticky lg:top-[76px] lg:self-start">
          <nav aria-label="Settings sections" className="max-lg:flex max-lg:flex-wrap max-lg:gap-1 lg:space-y-0.5">
            {SETTINGS_NAV.map((item) => {
              const active = mounted ? pathname === item.href : false;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium outline-none transition-colors focus-ring",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("size-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Section content */}
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

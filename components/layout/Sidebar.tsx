"use client";

import * as React from "react";
import Link from "next/link";
import { Tooltip } from "@/components/ui/misc";
import { BrandMark, SidebarNav } from "@/components/layout/SidebarNav";

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ collapsed = false, onToggleCollapse }: SidebarProps) {
  return (
    <aside className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-slate-200 bg-white lg:flex transition-all duration-300 dark:border-border dark:bg-background ${collapsed ? 'w-16' : 'w-60'}`}>
      {/* Brand */}
      {collapsed ? (
        <Tooltip label="Zimora Cloud POS" side="right">
          <Link
            href="/dashboard"
            className="flex h-[60px] shrink-0 items-center justify-center border-b border-slate-100 px-4 outline-none focus-ring dark:border-border"
          >
            <BrandMark collapsed={collapsed} />
          </Link>
        </Tooltip>
      ) : (
        <Link
          href="/dashboard"
          className="flex h-[60px] shrink-0 items-center gap-2.5 border-b border-slate-100 px-4 outline-none focus-ring dark:border-border"
        >
          <BrandMark collapsed={collapsed} />
          <span className="text-[15px] font-semibold tracking-tight">Zimora Cloud POS</span>
        </Link>
      )}

      <SidebarNav collapsed={collapsed} />
    </aside>
  );
}

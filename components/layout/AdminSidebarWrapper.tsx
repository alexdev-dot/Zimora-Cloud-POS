"use client";

import * as React from "react";
import Link from "next/link";
import { Tooltip } from "@/components/ui/misc";
import { AdminBrandMark, AdminSidebarNav } from "@/components/layout/AdminSidebar";

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminSidebar({ collapsed = false, onToggleCollapse }: AdminSidebarProps) {
  return (
    <aside className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-slate-200 bg-white lg:flex transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
      {/* Brand */}
      {collapsed ? (
        <Tooltip label="Zimora Cloud POS Admin" side="right">
          <Link
            href="/admin/dashboard"
            className="flex h-[60px] shrink-0 items-center justify-center border-b border-slate-100 px-4 outline-none focus-ring"
          >
            <AdminBrandMark collapsed={collapsed} />
          </Link>
        </Tooltip>
      ) : (
        <Link
          href="/admin/dashboard"
          className="flex h-[60px] shrink-0 items-center gap-2.5 border-b border-slate-100 px-4 outline-none focus-ring"
        >
          <AdminBrandMark collapsed={collapsed} />
          <span className="text-[15px] font-semibold tracking-tight">Zimora Admin</span>
        </Link>
      )}

      <AdminSidebarNav collapsed={collapsed} />
    </aside>
  );
}

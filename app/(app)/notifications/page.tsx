"use client";

import * as React from "react";
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  CheckCircle2,
  CreditCard,
  Info,
  RotateCcw,
  Trash2,
  UserPlus,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/states";
import { cn, timeAgo } from "@/lib/utils";
import Link from "next/link";
import type { NotificationType } from "@/types";

const ICONS: Record<NotificationType, { icon: LucideIcon; className: string }> = {
  low_stock: { icon: AlertTriangle, className: "bg-amber-50 text-amber-600" },
  payment: { icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600" },
  failed_payment: { icon: XCircle, className: "bg-red-50 text-red-600" },
  refund: { icon: RotateCcw, className: "bg-violet-50 text-violet-600" },
  employee: { icon: UserPlus, className: "bg-sky-50 text-sky-600" },
  subscription: { icon: CreditCard, className: "bg-teal-50 text-teal-600" },
  system: { icon: Info, className: "bg-slate-100 text-slate-600" },
};

export default function NotificationsPage() {
  const [items, setItems] = React.useState<any[]>([]);
  const [filter, setFilter] = React.useState<"all" | "unread" | NotificationType>("all");

  const filtered = items.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const getIconMeta = (type: string) => {
    return ICONS[type as NotificationType] || ICONS.system;
  };
  const unread = items.filter((n) => !n.read).length;

  function markAll() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  }

  return (
    <div className="page space-y-5">
      <PageHeader
        title="Notifications"
        description={unread > 0 ? `${unread} unread notifications` : "You're all caught up"}
        actions={
          <Button variant="outline" onClick={markAll} disabled={unread === 0}>
            <CheckCheck /> Mark all read
          </Button>
        }
      />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList variant="underline">
          <TabsTrigger variant="underline" value="all">
            All
          </TabsTrigger>
          <TabsTrigger variant="underline" value="unread">
            Unread {unread > 0 && <span className="ml-1 rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">{unread}</span>}
          </TabsTrigger>
          <TabsTrigger variant="underline" value="low_stock">Stock</TabsTrigger>
          <TabsTrigger variant="underline" value="payment">Payments</TabsTrigger>
          <TabsTrigger variant="underline" value="refund">Refunds</TabsTrigger>
          <TabsTrigger variant="underline" value="system">System</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bell}
            title={filter === "unread" ? "No unread notifications" : "Nothing here yet"}
            description={
              filter === "unread"
                ? "You're all caught up. New alerts will appear here as they happen."
                : "Notifications about stock, payments and team changes will appear here."
            }
          />
        </Card>
      ) : (
        <Card className="divide-y divide-border/70 overflow-hidden">
          {filtered.map((n) => {
            const meta = getIconMeta(n.type);
            const Icon = meta.icon;
            return (
              <div
                key={n.id}
                className={cn(
                  "group flex items-start gap-3.5 px-4 py-3.5 transition-colors md:px-5",
                  !n.read && "bg-primary/[0.035]"
                )}
              >
                <span className={cn("mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg", meta.className)}>
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13.5px] font-semibold leading-snug">{n.title}</p>
                    {!n.read && <span className="size-2 rounded-full bg-primary" aria-label="Unread" />}
                  </div>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground/80">{timeAgo(n.time)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {n.href && (
                    <Button asChild variant="ghost" size="sm" className="text-primary">
                      <Link href={n.href}>View</Link>
                    </Button>
                  )}
                  {!n.read && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Mark as read"
                      className="text-muted-foreground"
                      onClick={() => setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
                    >
                      <CheckCheck />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete notification"
                    className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                    onClick={() => {
                      setItems((prev) => prev.filter((x) => x.id !== n.id));
                      toast.success("Notification dismissed");
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}

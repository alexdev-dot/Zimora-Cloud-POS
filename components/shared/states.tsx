import * as React from "react";
import { AlertTriangle, Loader2, PackageOpen, RefreshCw, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

/* ── Empty state ──────────────────────────────────────────────────── */

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  action,
  className,
  compact,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 text-center", compact ? "py-10" : "py-16", className)}>
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <h3 className="text-[15px] font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ── Error state ──────────────────────────────────────────────────── */

export function ErrorState({
  title = "Something went wrong.",
  description = "We couldn't load this data. Check your connection and try again.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-16 text-center", className)}>
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
        <AlertTriangle className="size-5" />
      </div>
      <h3 className="text-[15px] font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">{description}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          <RefreshCw /> Try Again
        </Button>
      )}
    </div>
  );
}

/* ── Table skeleton (loading) ─────────────────────────────────────── */

export function TableSkeleton({
  rows = 6,
  className,
  withToolbar,
}: {
  rows?: number;
  className?: string;
  withToolbar?: boolean;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card", className)}>
      {withToolbar && (
        <div className="flex items-center justify-between border-b border-border p-4">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-56" />
        </div>
      )}
      <div className="p-4">
        <div className="mb-4 flex gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-20" />
          ))}
        </div>
        <div className="space-y-3.5">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="size-9 rounded-lg" />
              <Skeleton className="h-3.5 flex-1" style={{ maxWidth: `${55 + ((i * 17) % 35)}%` }} />
              <Skeleton className="hidden h-3.5 w-24 sm:block" />
              <Skeleton className="hidden h-3.5 w-16 md:block" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Inline loading ───────────────────────────────────────────────── */

export function InlineSpinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-4 animate-spin", className)} aria-label="Loading" />;
}

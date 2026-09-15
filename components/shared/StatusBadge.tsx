import { PAYMENT_META } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types";
import { Badge } from "@/components/ui/badge";

type BadgeVariant = "success" | "warning" | "destructive" | "info" | "purple" | "default" | "primary";

const STATUS_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  completed: { label: "Completed", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  refunded: { label: "Refunded", variant: "destructive" },
  partially_refunded: { label: "Partial refund", variant: "purple" },
  active: { label: "Active", variant: "success" },
  archived: { label: "Archived", variant: "default" },
  inactive: { label: "Inactive", variant: "default" },
  on_shift: { label: "On shift", variant: "primary" },
  in_stock: { label: "In Stock", variant: "success" },
  low_stock: { label: "Low Stock", variant: "warning" },
  out_of_stock: { label: "Out of Stock", variant: "destructive" },
  draft: { label: "Draft", variant: "default" },
  sent: { label: "Sent", variant: "info" },
  partial: { label: "Partial", variant: "warning" },
  received: { label: "Received", variant: "success" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  connected: { label: "Connected", variant: "success" },
  not_connected: { label: "Not connected", variant: "default" },
  open: { label: "Open", variant: "success" },
  closed: { label: "Closed", variant: "default" },
  paid: { label: "Paid", variant: "success" },
  unpaid: { label: "Unpaid", variant: "warning" },
};

export function StatusBadge({
  status,
  label,
  variant,
  className,
  dot,
}: {
  status?: string;
  label?: string;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}) {
  const key = (status ?? "").toLowerCase();
  const meta = STATUS_MAP[key] ?? { label: label ?? status ?? "—", variant: variant ?? "default" };
  return (
    <Badge variant={meta.variant} className={cn("gap-1", className)}>
      {dot && (
        <span
          aria-hidden
          className={cn(
            "size-1.5 rounded-full",
            meta.variant === "success" && "bg-emerald-500",
            meta.variant === "warning" && "bg-amber-500",
            meta.variant === "destructive" && "bg-red-500",
            meta.variant === "info" && "bg-sky-500",
            meta.variant === "purple" && "bg-violet-500",
            meta.variant === "primary" && "bg-primary",
            meta.variant === "default" && "bg-slate-400"
          )}
        />
      )}
      {meta.label}
    </Badge>
  );
}

export function PaymentBadge({ method, className }: { method: PaymentMethod; className?: string }) {
  const meta = PAYMENT_META[method];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
        meta.className,
        className
      )}
    >
      <Icon className="size-3" />
      {meta.label}
    </span>
  );
}

export const ROLE_BADGE: Record<string, string> = {
  Owner: "bg-violet-50 text-violet-700 ring-1 ring-violet-200/60",
  Administrator: "bg-sky-50 text-sky-700 ring-1 ring-sky-200/60",
  Manager: "bg-teal-50 text-teal-700 ring-1 ring-teal-200/60",
  Cashier: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  "Inventory Manager": "bg-amber-50 text-amber-800 ring-1 ring-amber-200/60",
};

export function RoleBadge({ role }: { role: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", ROLE_BADGE[role] ?? ROLE_BADGE.Cashier)}>
      {role}
    </span>
  );
}

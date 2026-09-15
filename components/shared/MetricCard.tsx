import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

type Tone = "default" | "primary" | "warning" | "destructive" | "info";

const iconTones: Record<Tone, string> = {
  default: "bg-slate-100 text-slate-600",
  primary: "bg-primary/10 text-primary",
  warning: "bg-amber-50 text-amber-600",
  destructive: "bg-red-50 text-red-600",
  info: "bg-sky-50 text-sky-600",
};

export interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconTone?: Tone;
  change?: { value: number; caption: string; goodWhenUp?: boolean };
  footer?: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  iconTone = "primary",
  change,
  footer,
  className,
  loading,
}: MetricCardProps) {
  const up = (change?.value ?? 0) > 0;
  const good = change ? (change.goodWhenUp === false ? !up : up) : true;
  const DeltaIcon = up ? ArrowUpRight : (change?.value ?? 0) < 0 ? ArrowDownRight : Minus;

  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <p className="truncate text-[13px] font-medium text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="h-7 w-28" />
          ) : (
            <p className="text-[26px] font-semibold leading-none tracking-tight tabular-nums">
              {value}
            </p>
          )}
        </div>
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", iconTones[iconTone])}>
          <Icon className="size-[18px]" />
        </span>
      </div>
      {change && !loading && (
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold tabular-nums",
              good ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            )}
          >
            <DeltaIcon className="size-3" />
            {Math.abs(change.value).toFixed(1)}%
          </span>
          <span className="text-muted-foreground">{change.caption}</span>
        </div>
      )}
      {footer && <div className="mt-3">{footer}</div>}
    </Card>
  );
}

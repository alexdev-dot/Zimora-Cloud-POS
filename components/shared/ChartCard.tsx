import * as React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  height?: string;
  loading?: boolean;
  footer?: React.ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  actions,
  children,
  className,
  height = "h-72",
  loading,
  footer,
}: ChartCardProps) {
  return (
    <Card className={cn("flex flex-col p-5", className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className={cn("min-h-0 flex-1", height)}>
        {loading ? <Skeleton className="size-full" /> : children}
      </div>
      {footer && <div className="mt-3 border-t border-border pt-3">{footer}</div>}
    </Card>
  );
}

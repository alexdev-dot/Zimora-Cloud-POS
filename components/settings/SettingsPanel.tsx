"use client";

import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SettingsPanel({
  title,
  description,
  children,
  footer,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
        {description && <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-4 px-5 py-5">{children}</div>
      {footer && (
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-muted/30 px-5 py-3.5">
          {footer}
        </div>
      )}
    </Card>
  );
}

export function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: React.ReactNode;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-3.5 py-3">
      <div className="min-w-0">
        <p className="text-[13.5px] font-medium">{label}</p>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-label={typeof label === "string" ? label : undefined}
      />
    </div>
  );
}

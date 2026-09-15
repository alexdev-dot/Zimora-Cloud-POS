"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn, getInitials, avatarTone } from "@/lib/utils";

/* ── Skeleton ─────────────────────────────────────────────────────── */

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-md bg-slate-200/70", className)}
      {...props}
    />
  );
}

/* ── Separator ────────────────────────────────────────────────────── */

function Separator({
  className,
  vertical,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { vertical?: boolean }) {
  return (
    <div
      role="separator"
      className={cn(vertical ? "h-6 w-px" : "h-px w-full", "shrink-0 bg-border", className)}
      {...props}
    />
  );
}

/* ── Avatar (initials, deterministic tone) ────────────────────────── */

function Avatar({
  name,
  className,
  size = 8,
}: {
  name: string;
  className?: string;
  size?: number;
}) {
  return (
    <span
      title={name}
      style={{ width: `${size * 4}px`, height: `${size * 4}px`, fontSize: `${Math.max(10, size * 1.4)}px` }}
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold ring-1 ring-inset ring-black/5",
        avatarTone(name),
        className
      )}
    >
      {getInitials(name)}
    </span>
  );
}

/* ── Tooltip ──────────────────────────────────────────────────────── */

const TooltipProvider = TooltipPrimitive.Provider;
const TooltipRoot = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-md animate-fade-in",
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = "TooltipContent";

function Tooltip({
  children,
  label,
  side = "top",
}: {
  children: React.ReactNode;
  label: string;
  side?: "top" | "bottom" | "left" | "right";
}) {
  return (
    <TooltipRoot>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </TooltipRoot>
  );
}

export { Skeleton, Separator, Avatar, TooltipProvider, Tooltip, TooltipContent };

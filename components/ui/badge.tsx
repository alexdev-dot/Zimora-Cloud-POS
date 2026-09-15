import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        primary: "bg-primary/10 text-primary",
        success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60",
        warning: "bg-amber-50 text-amber-800 ring-1 ring-amber-200/60",
        destructive: "bg-red-50 text-red-700 ring-1 ring-red-200/60",
        info: "bg-sky-50 text-sky-700 ring-1 ring-sky-200/60",
        purple: "bg-violet-50 text-violet-700 ring-1 ring-violet-200/60",
        outline: "border border-border text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), "gap-1.5", className)} {...props}>
      {dot && (
        <span
          aria-hidden
          className={cn(
            "size-1.5 rounded-full",
            variant === "success" && "bg-emerald-500",
            variant === "warning" && "bg-amber-500",
            variant === "destructive" && "bg-red-500",
            variant === "info" && "bg-sky-500",
            variant === "purple" && "bg-violet-500",
            variant === "primary" && "bg-primary",
            (!variant || variant === "default") && "bg-slate-400"
          )}
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };

import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  backHref?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, actions, backHref, className, children }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:gap-4 md:flex-row md:items-start md:justify-between", className)}>
      <div className="min-w-0 space-y-1">
        {backHref && (
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-0.5 text-muted-foreground">
            <a href={backHref}>
              <ArrowLeft /> Back
            </a>
          </Button>
        )}
        <h1 className="truncate text-lg sm:text-xl font-semibold tracking-tight md:text-[22px]">{title}</h1>
        {description && <p className="text-[13px] text-muted-foreground">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">{actions}</div>}
    </div>
  );
}

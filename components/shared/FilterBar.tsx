import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  children: React.ReactNode;
  className?: string;
  onReset?: () => void;
  activeCount?: number;
}

export function FilterBar({ children, className, onReset, activeCount = 0 }: FilterBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
      {onReset && activeCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
          <X /> Reset{activeCount > 1 ? ` (${activeCount})` : ""}
        </Button>
      )}
    </div>
  );
}

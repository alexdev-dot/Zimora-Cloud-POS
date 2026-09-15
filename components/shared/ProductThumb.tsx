import { CATEGORY_META } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";
import { Package } from "lucide-react";

/**
 * Consistent visual placeholder for products without photos.
 * Uses a category-tinted tile with the category icon (or initials when a name is given).
 */
export function ProductThumb({
  category,
  name,
  className,
  iconClassName,
}: {
  category: Category;
  name?: string;
  className?: string;
  iconClassName?: string;
}) {
  const meta = CATEGORY_META[category] || CATEGORY_META.Other;
  const Icon = meta.icon;
  return (
    <span
      aria-hidden
      className={cn(
        "flex items-center justify-center rounded-lg ring-1 ring-inset",
        meta.tile,
        className
      )}
    >
      {name ? (
        <span className={cn("font-semibold tracking-tight", iconClassName)}>
          {name
            .split(" ")
            .map((w) => w[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </span>
      ) : (
        <Icon className={cn("size-1/3 max-h-8 max-w-8", iconClassName)} />
      )}
    </span>
  );
}

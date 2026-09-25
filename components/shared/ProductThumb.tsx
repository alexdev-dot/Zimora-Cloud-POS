import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

/**
 * Consistent visual placeholder for products without photos.
 * Uses a default tile with initials when a name is given.
 * Displays actual product image when imageUrl is provided.
 */
export function ProductThumb({
  category,
  name,
  imageUrl,
  className,
  iconClassName,
}: {
  category: string;
  name?: string;
  imageUrl?: string | null;
  className?: string;
  iconClassName?: string;
}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name || category}
        className={cn(
          "rounded-lg ring-1 ring-inset ring-slate-200/60 object-cover",
          className
        )}
        onError={(e) => {
          // Fallback to placeholder if image fails to load
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "flex items-center justify-center rounded-lg ring-1 ring-inset bg-slate-100 text-slate-600 ring-slate-200/60",
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
        <Package className={cn("size-1/3 max-h-8 max-w-8", iconClassName)} />
      )}
    </span>
  );
}

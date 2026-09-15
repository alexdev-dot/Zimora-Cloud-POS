"use client";

import * as React from "react";
import { Plus, ScanLine, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductThumb } from "@/components/shared/ProductThumb";
import { EmptyState } from "@/components/shared/states";
import { CATEGORIES } from "@/lib/constants";
import { cn, formatKES } from "@/lib/utils";
import type { Category, Product, StockStatus } from "@/types";

export function StockChip({ status, stock }: { status: StockStatus; stock: number }) {
  const cls =
    status === "out_of_stock"
      ? "bg-red-50 text-red-700 ring-red-200/70"
      : status === "low_stock"
        ? "bg-amber-50 text-amber-800 ring-amber-200/70"
        : "bg-emerald-50 text-emerald-700 ring-emerald-200/70";
  const label =
    status === "out_of_stock" ? "Out" : status === "low_stock" ? `Low · ${stock}` : `${stock} left`;
  return (
    <span className={cn("rounded-full px-1.5 py-0.5 text-[10.5px] font-medium ring-1 tabular-nums", cls)}>
      {label}
    </span>
  );
}

export function ProductGrid({
  products,
  search,
  onSearch,
  category,
  onCategory,
  onAdd,
  onScan,
  searchRef,
}: {
  products: Product[];
  search: string;
  onSearch: (v: string) => void;
  category: Category | "All";
  onCategory: (c: Category | "All") => void;
  onAdd: (p: Product) => void;
  onScan: () => void;
  searchRef?: React.RefObject<HTMLInputElement>;
}) {
  const counts = React.useMemo(() => {
    const map = new Map<Category | "All", number>();
    map.set("All", products.length);
    for (const p of products) map.set(p.category, (map.get(p.category) ?? 0) + 1);
    return map;
  }, [products]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Search + scan */}
      <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-3">
        <div className="relative flex-1">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={searchRef}
            role="searchbox"
            aria-label="Search products"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search products or scan…"
            className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm shadow-[0_1px_2px_rgba(16,24,40,0.04)] placeholder:text-muted-foreground/70 focus-ring sm:pr-9"
          />
          <kbd className="kbd pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 sm:inline-flex">/</kbd>
        </div>
        <Button variant="outline" size="lg" onClick={onScan} aria-label="Scan barcode" className="shrink-0">
          <ScanLine />
          <span className="max-sm:hidden">Scan</span>
        </Button>
      </div>

      {/* Category tabs */}
      <div
        role="tablist"
        aria-label="Product categories"
        className="flex gap-1.5 overflow-x-auto border-b border-border bg-card px-4 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {(["All", ...CATEGORIES] as (Category | "All")[]).map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={category === c}
            onClick={() => onCategory(c)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors focus-ring",
              category === c
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-slate-200/70 hover:text-foreground"
            )}
          >
            {c}
            <span className={cn("ml-1.5 text-[11px] tabular-nums", category === c ? "text-primary-foreground/70" : "opacity-60")}>
              {counts.get(c) ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-24 md:pb-4">
        {products.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No products found"
            description={`Nothing matches "${search}" in this category.`}
            compact
            action={
              <Button
                variant="outline"
                onClick={() => {
                  onSearch("");
                  onCategory("All");
                }}
              >
                Clear search
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
            {products.map((p) => {
              const out = p.stock <= 0;
              return (
                <button
                  key={p.id}
                  onClick={() => onAdd(p)}
                  disabled={out}
                  aria-label={`Add ${p.name}, ${formatKES(p.price)}`}
                  className={cn(
                    "group relative flex flex-col rounded-xl border border-border bg-card p-3 text-left shadow-card outline-none transition-all focus-ring",
                    out
                      ? "cursor-not-allowed opacity-55"
                      : "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-pop active:translate-y-0 active:scale-[.98]"
                  )}
                >
                  <ProductThumb category={p.category} className="mb-2.5 aspect-[5/3] w-full" />
                  <p className="line-clamp-2 min-h-[2.4em] text-[13px] font-medium leading-snug">{p.name}</p>
                  <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-wide text-muted-foreground">
                    {p.sku}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[15px] font-semibold tabular-nums">{formatKES(p.price)}</span>
                    <StockChip
                      status={out ? "out_of_stock" : p.stock <= p.minStock ? "low_stock" : "in_stock"}
                      stock={p.stock}
                    />
                  </div>
                  {!out && (
                    <span className="absolute right-2.5 top-2.5 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                      <Plus className="size-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { Barcode as BarcodeIcon, Pencil, Printer } from "lucide-react";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ProductThumb } from "@/components/shared/ProductThumb";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Barcode } from "@/components/shared/Barcode";
import { formatKES, formatDate } from "@/lib/utils";
import { stockStatusOf, STOCK_STATUS_META } from "@/lib/utils/products";
import type { Product } from "@/types";

export function ProductDetailSheet({
  product,
  onOpenChange,
  onEdit,
}: {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (p: Product) => void;
}) {
  if (!product) return null;
  const status = stockStatusOf(product);
  const margin = product.price > 0 ? Math.round(((product.price - product.cost) / product.price) * 100) : 0;

  return (
    <Sheet open={Boolean(product)} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <ProductThumb category={product.category} imageUrl={product.imageUrl} className="size-14 text-xl" />
            <div className="min-w-0">
              <SheetTitle className="truncate">{product.name}</SheetTitle>
              <SheetDescription className="font-mono">
                {product.sku}
              </SheetDescription>
              <div className="mt-1.5 flex gap-1.5">
                <StatusBadge status={status} dot />
                <StatusBadge status={product.status} />
              </div>
            </div>
          </div>
        </SheetHeader>

        <SheetBody className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Selling price" value={formatKES(product.price)} />
            <Stat label="Cost price" value={formatKES(product.cost)} />
            <Stat label="Margin" value={`${margin}%`} accent />
          </div>

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Stock
            </h4>
            <div className="rounded-lg border border-border p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-muted-foreground">Current</span>
                <span className="font-semibold tabular-nums">
                  {product.stock} {product.unit}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={
                    "h-full rounded-full " +
                    (status === "out_of_stock" ? "bg-red-500" : status === "low_stock" ? "bg-amber-500" : "bg-primary")
                  }
                  style={{
                    width: `${Math.min(100, (product.stock / Math.max(1, product.maxStock)) * 100)}%`,
                  }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-muted-foreground tabular-nums">
                <span>Min {product.minStock}</span>
                <span>{STOCK_STATUS_META[status].label}</span>
                <span>Max {product.maxStock}</span>
              </div>
            </div>
          </div>

          <dl className="space-y-2.5 text-[13px]">
            <Row label="Barcode" value={product.barcode} mono />
            <Row label="Category" value={product.category} />
            <Row label="Supplier" value={product.supplier} />
            <Row label="Location" value={product.location} />
            <Row label="Tax rate" value={`${product.taxRate}% VAT`} />
            <Row label="Units sold" value={`${product.sold} all-time`} />
            <Row label="Stock value" value={formatKES(product.stock * product.cost)} />
            <Row label="Last updated" value={formatDate(product.updatedAt, true)} />
          </dl>

          {product.description && (
            <div>
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </h4>
              <p className="text-[13px] leading-relaxed text-muted-foreground">{product.description}</p>
            </div>
          )}

          <div className="rounded-lg border border-border bg-muted/30 p-3.5 text-center">
            <p className="mb-2 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
              <BarcodeIcon className="size-3.5" /> Barcode label
            </p>
            <div className="inline-block rounded bg-white p-2">
              <Barcode value={product.barcode} height={36} />
            </div>
          </div>
        </SheetBody>

        <SheetFooter className="flex-row gap-2">
          <Button variant="outline" className="flex-1" onClick={() => window.print()}>
            <Printer /> Print label
          </Button>
          <Button className="flex-1" onClick={() => onEdit(product)}>
            <Pencil /> Edit product
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={"mt-0.5 text-[15px] font-semibold tabular-nums " + (accent ? "text-primary" : "")}>
        {value}
      </p>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={"text-right font-medium " + (mono ? "font-mono text-xs" : "")}>{value}</dd>
    </div>
  );
}

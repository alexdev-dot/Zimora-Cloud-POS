"use client";

import * as React from "react";
import { Minus, Plus, ShoppingBasket, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/shared/states";

import { cn, formatKES } from "@/lib/utils";
import type { CartLine } from "@/types";

export interface CartTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export function CartPanel({
  lines,
  onQty,
  onRemove,
  customerId,
  onCustomer,
  discount,
  onDiscount,
  totals,
  onCheckout,
  onHold,
  onClear,
}: {
  lines: CartLine[];
  onQty: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  customerId: string;
  onCustomer: (id: string) => void;
  discount: string;
  onDiscount: (v: string) => void;
  totals: CartTotals;
  onCheckout: () => void;
  onHold: () => void;
  onClear: () => void;
}) {
  const selected = customerId === "walkin" ? null : { id: customerId, name: "Customer", phone: "—", loyaltyPoints: 0 };
  const itemCount = lines.reduce((a, l) => a + l.qty, 0);

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
          Current Sale
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground tabular-nums">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </h2>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Clear cart"
          disabled={lines.length === 0}
          onClick={onClear}
          className="text-muted-foreground"
        >
          <Trash2 />
        </Button>
      </div>

      {/* Customer */}
      <div className="border-b border-border px-4 py-2.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="focus-ring flex w-full items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2 text-left transition-colors hover:bg-muted/50"
              aria-label="Select customer"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <UserRound className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium">{selected?.name ?? "Walk-in Customer"}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {selected ? `${selected.phone} · ${selected.loyaltyPoints} pts` : "Anonymous sale — no loyalty"}
                </span>
              </span>
              <span className="text-[11px] font-medium text-primary">Change</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-72 w-64 overflow-y-auto">
            <DropdownMenuLabel>Customer</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => onCustomer("walkin")}>
              <UserRound />
              <span className="flex-1">Walk-in Customer</span>
              {customerId === "walkin" && <span className="text-xs text-primary">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <span className="text-muted-foreground">No customers available yet</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Lines */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {lines.length === 0 ? (
          <EmptyState
            icon={ShoppingBasket}
            compact
            className="h-full justify-center"
            title="Cart is empty"
            description="Tap products on the left to add them to this sale."
          />
        ) : (
          <ul className="divide-y divide-border/70">
            {lines.map((l) => (
              <li key={l.product.id} className="flex items-start gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium leading-snug">{l.product.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                    {formatKES(l.product.price)} × {l.qty}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label={`Decrease ${l.product.name}`}
                      className="size-7 rounded-md"
                      onClick={() => onQty(l.product.id, -1)}
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span
                      className="w-8 text-center text-[13px] font-semibold tabular-nums"
                      aria-live="polite"
                      aria-label={`Quantity ${l.qty}`}
                    >
                      {l.qty}
                    </span>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label={`Increase ${l.product.name}`}
                      className="size-7 rounded-md"
                      disabled={l.qty >= l.product.stock}
                      onClick={() => onQty(l.product.id, 1)}
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[13px] font-semibold tabular-nums">
                    {formatKES(l.product.price * l.qty)}
                  </span>
                  <button
                    onClick={() => onRemove(l.product.id)}
                    aria-label={`Remove ${l.product.name}`}
                    className="focus-ring rounded p-1 text-muted-foreground transition-colors hover:bg-red-50 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Summary */}
      <div className="border-t border-border px-4 py-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <label htmlFor="pos-discount" className="text-[13px] font-medium text-muted-foreground">
            Discount (KSh)
          </label>
          <input
            id="pos-discount"
            inputMode="decimal"
            value={discount}
            onChange={(e) => onDiscount(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0"
            className="h-8 w-24 rounded-md border border-input bg-card px-2 text-right text-[13px] tabular-nums focus-ring"
          />
        </div>
        <dl className="space-y-1 text-[13px]">
          <div className="flex justify-between text-muted-foreground">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{formatKES(totals.subtotal)}</dd>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <dt>Discount</dt>
              <dd className="tabular-nums text-amber-700">−{formatKES(totals.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <dt>VAT (16%)</dt>
            <dd className="tabular-nums">{formatKES(totals.tax)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatKES(totals.total)}</dd>
          </div>
        </dl>
        <div className="mt-3 flex gap-2">
          <Button
            variant="outline"
            onClick={onHold}
            disabled={lines.length === 0}
            className="max-lg:hidden"
          >
            Hold
          </Button>
          <Button
            size="lg"
            className={cn("flex-1 text-[15px]")}
            disabled={lines.length === 0}
            onClick={onCheckout}
          >
            Charge {formatKES(totals.total)}
          </Button>
        </div>
      </div>
    </div>
  );
}

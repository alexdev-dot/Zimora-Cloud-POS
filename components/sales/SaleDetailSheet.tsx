"use client";

import * as React from "react";
import { Download, Printer, RotateCcw } from "lucide-react";
import { toast } from "sonner";
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
import { Separator } from "@/components/ui/misc";
import { Avatar } from "@/components/ui/misc";
import { PaymentBadge, StatusBadge } from "@/components/shared/StatusBadge";
import { ProductThumb } from "@/components/shared/ProductThumb";
import { Receipt } from "@/components/pos/Receipt";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { productById } from "@/lib/utils/products";
import { formatKES, formatDate } from "@/lib/utils";
import type { Sale, Product } from "@/types";

export function SaleDetailSheet({
  sale,
  onOpenChange,
  onRefunded,
  products,
}: {
  sale: Sale | null;
  onOpenChange: (open: boolean) => void;
  onRefunded: (sale: Sale) => void;
  products: Product[];
}) {
  const [refundOpen, setRefundOpen] = React.useState(false);

  React.useEffect(() => setRefundOpen(false), [sale]);

  if (!sale) return null;
  const refundable = sale.status === "completed" || sale.status === "partially_refunded";

  return (
    <Sheet open={Boolean(sale)} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between gap-2">
            <SheetTitle>{sale.orderNo}</SheetTitle>
            <StatusBadge status={sale.status} dot />
          </div>
          <SheetDescription>{formatDate(sale.date, true)} · {sale.branch}</SheetDescription>
        </SheetHeader>

        <SheetBody className="space-y-5">
          {/* People */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Customer</p>
              <div className="mt-1.5 flex items-center gap-2">
                <Avatar name={sale.customerName} size={7} />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">{sale.customerName}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {sale.customerId === "walkin" ? "Anonymous" : "Loyalty member"}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Cashier</p>
              <div className="mt-1.5 flex items-center gap-2">
                <Avatar name={sale.cashier} size={7} />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">{sale.cashier}</p>
                  <p className="text-[11px] text-muted-foreground">{sale.branch}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <PaymentBadge method={sale.paymentMethod} />
              {sale.paymentRef && (
                <span className="font-mono text-[11px] text-muted-foreground">#{sale.paymentRef}</span>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground">Paid in full</span>
          </div>

          {/* Items */}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Items ({sale.items.reduce((a, i) => a + i.qty, 0)})
            </h4>
            <ul className="divide-y divide-border/70 rounded-lg border border-border">
              {sale.items.map((item, i) => {
                const p = productById(item.productId, products);
                return (
                  <li key={i} className="flex items-center gap-3 px-3 py-2.5">
                    {p && <ProductThumb category={p.category} className="size-8 shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground tabular-nums">
                        {item.qty} × {formatKES(item.unitPrice)}
                      </p>
                    </div>
                    <span className="text-[13px] font-semibold tabular-nums">
                      {formatKES(item.qty * item.unitPrice)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Totals */}
          <dl className="space-y-1.5 text-[13px]">
            <div className="flex justify-between text-muted-foreground">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatKES(sale.subtotal)}</dd>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <dt>Discount</dt>
                <dd className="tabular-nums text-amber-700">−{formatKES(sale.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <dt>VAT (16%)</dt>
              <dd className="tabular-nums">{formatKES(sale.tax)}</dd>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between text-[15px] font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatKES(sale.total)}</dd>
            </div>
          </dl>

          {/* Receipt (printable) */}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Receipt preview
            </h4>
            <div className="rounded-lg bg-muted/40 p-4">
              <div className="print-area">
                <Receipt
                  data={{
                    orderNo: sale.orderNo,
                    date: sale.date,
                    cashier: sale.cashier,
                    customerName: sale.customerName,
                    items: sale.items.map((i) => ({ name: i.name, qty: i.qty, unitPrice: i.unitPrice })),
                    subtotal: sale.subtotal,
                    discount: sale.discount,
                    tax: sale.tax,
                    total: sale.total,
                    paymentMethod: sale.paymentMethod,
                    paymentRef: sale.paymentRef,
                  }}
                />
              </div>
            </div>
          </div>
        </SheetBody>

        <SheetFooter className="grid grid-cols-3 gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer /> Print
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.success("Preparing PDF", { description: `${sale.orderNo} receipt will download shortly.` })}
          >
            <Download /> PDF
          </Button>
          <Button
            variant={refundable ? "destructive" : "outline"}
            disabled={!refundable}
            onClick={() => setRefundOpen(true)}
          >
            <RotateCcw /> Refund
          </Button>

          <ConfirmationDialog
            open={refundOpen}
            onOpenChange={setRefundOpen}
            title={`Refund ${sale.orderNo}?`}
            description={`KSh ${sale.total.toLocaleString()} will be returned to the customer via ${sale.paymentMethod === "mpesa" ? "M-Pesa" : sale.paymentMethod === "card" ? "card" : "cash"}. Stock will be restocked automatically.`}
            confirmLabel="Process refund"
            destructive
            onConfirm={() => {
              setRefundOpen(false);
              onRefunded(sale);
              onOpenChange(false);
              toast.success("Refund processed", {
                description: `${sale.orderNo} refunded · ${formatKES(sale.total)}`,
              });
            }}
          />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

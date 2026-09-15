"use client";

import * as React from "react";
import { CheckCircle2, Download, Mail, MessageCircle, Printer, Store } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PaymentBadge } from "@/components/shared/StatusBadge";
import { Receipt, type ReceiptData } from "@/components/pos/Receipt";
import { downloadBlob, formatKES } from "@/lib/utils";
import type { Sale } from "@/types";

export function SuccessModal({
  open,
  onOpenChange,
  sale,
  payment,
  onNewSale,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
  payment: (PaymentDataPlaceholder) | null;
  onNewSale: () => void;
}) {
  if (!sale) return null;
  const receiptData: ReceiptData = {
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
    amountReceived: payment?.amountReceived,
    change: payment?.change,
    splits: payment?.splits,
  };

  function downloadReceipt() {
    const rows = receiptData.items
      .map(
        (i) =>
          `<tr><td>${i.name} &times; ${i.qty}</td><td style="text-align:right">KSh ${(i.qty * i.unitPrice).toLocaleString()}</td></tr>`
      )
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Receipt ${sale!.orderNo}</title>
<style>body{font-family:ui-monospace,monospace;max-width:360px;margin:24px auto;color:#111}table{width:100%;border-collapse:collapse}td{padding:2px 0}.total{font-size:18px;font-weight:bold;border-top:2px solid #111;padding-top:6px}h2{text-align:center;margin:0}p{text-align:center;color:#555;font-size:12px;margin:2px 0}</style>
</head><body><h2>Zimora Supermarket</h2><p>Shop L23, Sarit Centre, Westlands, Nairobi · Tel +254 720 000 111</p>
<hr/><p>Receipt <b>${sale!.orderNo}</b> · ${new Date(sale!.date).toLocaleString()}<br/>Served by ${sale!.cashier}</p><hr/>
<table>${rows}</table><hr/>
<table><tr><td>Subtotal</td><td style="text-align:right">KSh ${sale!.subtotal.toLocaleString()}</td></tr>
${sale!.discount ? `<tr><td>Discount</td><td style="text-align:right">−KSh ${sale!.discount.toLocaleString()}</td></tr>` : ""}
<tr><td>VAT (16%)</td><td style="text-align:right">KSh ${sale!.tax.toLocaleString()}</td></tr>
<tr class="total"><td>TOTAL</td><td style="text-align:right">KSh ${sale!.total.toLocaleString()}</td></tr></table>
<hr/><p>Karibu tena! For feedback call +254 720 000 111.<br/>Powered by Zimora Cloud POS</p></body></html>`;
    downloadBlob(`receipt-${sale!.orderNo}.html`, html, "text/html");
    toast.success("Receipt downloaded", { description: `receipt-${sale!.orderNo}.html` });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <div className="flex flex-col items-center border-b border-border px-5 pb-4 pt-6 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="size-8 animate-pop-check" />
          </span>
          <DialogTitle className="mt-3 text-lg">Payment successful</DialogTitle>
          <p className="mt-1 text-[13px] text-muted-foreground">
            <span className="font-medium text-foreground">{sale.orderNo}</span> ·{" "}
            {formatKES(sale.total)} received
          </p>
          <div className="mt-2 flex items-center gap-2">
            <PaymentBadge method={sale.paymentMethod} />
            {receiptData.change !== undefined && receiptData.change > 0 && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200/60">
                Change {formatKES(receiptData.change)}
              </span>
            )}
          </div>
        </div>

        <div className="max-h-[46vh] overflow-y-auto bg-muted/40 px-5 py-5">
          <div className="print-area">
            <Receipt data={receiptData} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-border bg-muted/30 p-4 max-sm:grid-cols-1">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer /> Print receipt
          </Button>
          <Button variant="outline" onClick={downloadReceipt}>
            <Download /> Download receipt
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.success("Receipt emailed", {
                description: `A copy was sent to ${sale.customerName === "Walk-in Customer" ? "the customer" : sale.customerName}.`,
              })
            }
          >
            <Mail /> Email
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.success("Receipt sent via SMS", {
                description: "Customer received the receipt link on their phone.",
              })
            }
          >
            <MessageCircle /> Send SMS
          </Button>
        </div>
        <div className="border-t border-border p-4">
          <Button size="lg" className="w-full" onClick={onNewSale}>
            <Store /> New Sale
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type PaymentDataPlaceholder = {
  amountReceived?: number;
  change?: number;
  splits?: { method: import("@/types").PaymentMethod; amount: number }[];
};

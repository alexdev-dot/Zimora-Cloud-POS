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
import { formatKES, downloadReceiptAsHTML, generateReceiptPDF } from "@/lib/utils";
import type { Sale, ReceiptSettings } from "@/types";

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
  // Get receipt and invoice settings from localStorage
  const [receiptSettings] = React.useState<ReceiptSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zimora-receipt-settings');
      return saved ? JSON.parse(saved) : { template: 'classic', width: '80mm' };
    }
    return { template: 'classic', width: '80mm' };
  });

  const [invoiceSettings] = React.useState<ReceiptSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zimora-invoice-settings');
      return saved ? JSON.parse(saved) : { template: 'professional', width: '80mm' };
    }
    return { template: 'professional', width: '80mm' };
  });

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

  function downloadReceipt(format: "html" | "pdf" = "html", documentType: "receipt" | "invoice" = "receipt") {
    const settings = documentType === "invoice" ? invoiceSettings : receiptSettings;
    
    if (format === "pdf") {
      generateReceiptPDF(receiptData, documentType).then((fileName) => {
        toast.success(`${documentType === "invoice" ? "Invoice" : "Receipt"} downloaded`, { 
          description: fileName 
        });
      });
    } else {
      const fileName = downloadReceiptAsHTML(receiptData, documentType);
      toast.success(`${documentType === "invoice" ? "Invoice" : "Receipt"} downloaded`, { 
        description: fileName 
      });
    }
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
            <Receipt data={receiptData} settings={receiptSettings} documentType="receipt" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-border bg-muted/30 p-4 max-sm:grid-cols-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer /> Print
          </Button>
          <Button variant="outline" onClick={() => downloadReceipt("html", "receipt")}>
            <Download /> HTML
          </Button>
          <Button variant="outline" onClick={() => downloadReceipt("pdf", "receipt")}>
            <Download /> PDF
          </Button>
          <Button variant="outline" onClick={() => downloadReceipt("html", "invoice")}>
            <Download /> Invoice
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
            <MessageCircle /> SMS
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

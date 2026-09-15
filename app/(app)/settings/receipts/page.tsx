"use client";

import * as React from "react";
import { Check, Printer, Star, FileText, Sparkles, Minimize, Briefcase, FileCheck, Receipt as ReceiptIcon } from "lucide-react";
import { toast } from "sonner";
import { SettingsPanel, ToggleRow } from "@/components/settings/SettingsPanel";
import { Button } from "@/components/ui/button";
import { FormField, NativeSelect, Textarea } from "@/components/ui/input";
import { Receipt as ReceiptComponent, type ReceiptData } from "@/components/pos/Receipt";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/lib/hooks";
import type { ReceiptSettings } from "@/types";

const defaultReceiptSettings: ReceiptSettings = {
  template: "classic",
  width: "80mm",
  footer: "Thank you for your business!",
  showLogo: true,
  showCashier: true,
  showCustomer: true,
  showTax: true,
  showQR: false,
  showBarcode: false,
  showBusinessInfo: true,
  showPaymentDetails: true,
  showItemSku: false,
  headerMessage: "Official Receipt",
  documentTitle: "RECEIPT",
} as const;

const defaultInvoiceSettings: ReceiptSettings = {
  template: "professional",
  width: "80mm",
  footer: "Payment due within 30 days. Thank you for your business!",
  showLogo: true,
  showCashier: true,
  showCustomer: true,
  showTax: true,
  showQR: false,
  showBarcode: true,
  showBusinessInfo: true,
  showPaymentDetails: true,
  showItemSku: true,
  headerMessage: "Tax Invoice",
  documentTitle: "INVOICE",
} as const;

const RECEIPT_SAMPLE: ReceiptData = {
  orderNo: "ORD-0001",
  date: "2024-09-14T12:00:00.000Z",
  cashier: "Cashier",
  customerName: "Customer",
  items: [
    { name: "Sample Product 1", sku: "SKU-001", qty: 2, unitPrice: 100 },
    { name: "Sample Product 2", sku: "SKU-002", qty: 1, unitPrice: 150 },
  ],
  subtotal: 350,
  discount: 0,
  tax: 56,
  total: 406,
  paymentMethod: "cash",
  paymentRef: "",
};

const INVOICE_SAMPLE: ReceiptData = {
  orderNo: "INV-2024-001",
  date: "2024-09-14T12:00:00.000Z",
  cashier: "John Doe",
  customerName: "ABC Corporation",
  items: [
    { name: "Office Supplies", sku: "SKU-001", qty: 5, unitPrice: 150 },
    { name: "Computer Equipment", sku: "SKU-002", qty: 2, unitPrice: 500 },
    { name: "Software License", sku: "SKU-003", qty: 1, unitPrice: 1000 },
  ],
  subtotal: 3750,
  discount: 100,
  tax: 584,
  total: 4234,
  paymentMethod: "card",
  paymentRef: "TXN-12345678",
};

const RECEIPT_TEMPLATES: { id: ReceiptSettings["template"]; name: string; blurb: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "classic", name: "Classic", blurb: "Monospace, dot-matrix style — works everywhere", icon: FileText },
  { id: "modern", name: "Modern", blurb: "Clean sans-serif with strong totals", icon: Sparkles },
  { id: "minimal", name: "Minimal", blurb: "Compact, left-aligned, save paper", icon: Minimize },
];

const INVOICE_TEMPLATES: { id: ReceiptSettings["template"]; name: string; blurb: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "professional", name: "Professional", blurb: "Business formal with strong borders — ideal for corporate clients", icon: Briefcase },
  { id: "modern", name: "Modern", blurb: "Clean contemporary design with subtle styling — perfect for retail and services", icon: Sparkles },
];

export default function ReceiptTemplatesPage() {
  const [activeTab, setActiveTab] = React.useState<"receipt" | "invoice">("receipt");
  const [receiptSettings, setReceiptSettings, receiptSaved] = useLocalStorage<ReceiptSettings>(
    "zimora-receipt-settings",
    defaultReceiptSettings
  );
  const [invoiceSettings, setInvoiceSettings, invoiceSaved] = useLocalStorage<ReceiptSettings>(
    "zimora-invoice-settings",
    defaultInvoiceSettings
  );

  const settings = activeTab === "receipt" ? receiptSettings : invoiceSettings;
  const saved = activeTab === "receipt" ? receiptSaved : invoiceSaved;
  const setSettings = activeTab === "receipt" ? setReceiptSettings : setInvoiceSettings;
  const sampleData = activeTab === "receipt" ? RECEIPT_SAMPLE : INVOICE_SAMPLE;
  const templates = activeTab === "receipt" ? RECEIPT_TEMPLATES : INVOICE_TEMPLATES;

  function set<K extends keyof ReceiptSettings>(key: K, value: ReceiptSettings[K]) {
    setSettings({ ...settings, [key]: value });
  }

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("receipt")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
            activeTab === "receipt"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <ReceiptIcon className="size-4" />
          Receipt
        </button>
        <button
          onClick={() => setActiveTab("invoice")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
            activeTab === "invoice"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <FileCheck className="size-4" />
          Invoice
        </button>
      </div>

      <SettingsPanel
        title={`${activeTab === "receipt" ? "Receipt" : "Invoice"} template style`}
        description={saved ? "Changes are saved to this browser automatically" : "Loading…"}
        footer={
          <>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer /> Print preview
            </Button>
            <Button
              onClick={() => {
                setSettings({ ...settings });
                toast.success(`${activeTab === "receipt" ? "Receipt" : "Invoice"} template saved as default`, {
                  description: `New ${activeTab === "receipt" ? "receipts" : "invoices"} will use this design.`
                });
              }}
            >
              <Star /> Set as default
            </Button>
          </>
        }
      >
        <div className={cn("grid gap-3", activeTab === "receipt" ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-3")}>
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => set("template", t.id as ReceiptSettings["template"])}
              aria-pressed={settings.template === t.id}
              className={cn(
                "relative rounded-xl border p-4 text-left outline-none transition-all focus-ring group",
                settings.template === t.id
                  ? "border-primary bg-accent/60 shadow-md ring-2 ring-primary/20"
                  : "border-border hover:border-slate-300 hover:shadow-sm"
              )}
            >
              {settings.template === t.id && (
                <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-white shadow-sm">
                  <Check className="size-3" strokeWidth={3} />
                </span>
              )}
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex size-10 items-center justify-center rounded-lg",
                  settings.template === t.id ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                )}>
                  <t.icon className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[13.5px] font-semibold">{t.name}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.blurb}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          {activeTab === "receipt" && (
            <>
              <FormField label="Receipt width" htmlFor="rc-width" hint="58mm for pocket printers, 80mm for counter printers">
                <NativeSelect
                  id="rc-width"
                  value={settings.width}
                  onChange={(e) => set("width", e.target.value as ReceiptSettings["width"])}
                >
                  <option value="80mm">80mm — counter printer</option>
                  <option value="58mm">58mm — compact printer</option>
                </NativeSelect>
              </FormField>
              <FormField label="Font" htmlFor="rc-font" hint="Template controls the base font; this adjusts size">
                <NativeSelect id="rc-font" defaultValue="regular">
                  <option value="compact">Compact</option>
                  <option value="regular">Regular</option>
                  <option value="large">Large (accessibility)</option>
                </NativeSelect>
              </FormField>
            </>
          )}
          <FormField label="Header message" htmlFor="rc-header" hint={`Shown at the top of the ${activeTab === "receipt" ? "receipt" : "invoice"} (e.g., '${activeTab === "receipt" ? "Official Receipt" : "Tax Invoice"}')`}>
            <Textarea
              id="rc-header"
              rows={1}
              value={settings.headerMessage || ""}
              onChange={(e) => set("headerMessage", e.target.value)}
            />
          </FormField>
          <FormField label={`${activeTab === "receipt" ? "Receipt" : "Invoice"} title`} htmlFor="rc-title" hint={`Main title shown on the ${activeTab === "receipt" ? "receipt" : "invoice"} (e.g., '${activeTab === "receipt" ? "RECEIPT" : "INVOICE"}')`}>
            <Textarea
              id="rc-title"
              rows={1}
              value={settings.documentTitle || ""}
              onChange={(e) => set("documentTitle", e.target.value)}
            />
          </FormField>
          <FormField label="Footer message" htmlFor="rc-footer" className="sm:col-span-2" hint={`Shown at the bottom of every ${activeTab === "receipt" ? "receipt" : "invoice"}`}>
            <Textarea
              id="rc-footer"
              rows={2}
              value={settings.footer}
              onChange={(e) => set("footer", e.target.value)}
            />
          </FormField>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          <ToggleRow label="Show logo" description="Print your business logo at the top" checked={settings.showLogo} onCheckedChange={(v) => set("showLogo", v)} />
          <ToggleRow label="Show cashier name" description="Who served the customer" checked={settings.showCashier} onCheckedChange={(v) => set("showCashier", v)} />
          <ToggleRow label="Show customer" description={`Customer name on the ${activeTab === "receipt" ? "receipt" : "invoice"}`} checked={settings.showCustomer} onCheckedChange={(v) => set("showCustomer", v)} />
          <ToggleRow label="Show business info" description="Address, phone, and tax PIN" checked={settings.showBusinessInfo} onCheckedChange={(v) => set("showBusinessInfo", v)} />
          <ToggleRow label="Show tax breakdown" description="VAT amount — required for KRA compliance" checked={settings.showTax} onCheckedChange={(v) => set("showTax", v)} />
          <ToggleRow label="Show payment details" description={`Payment method, reference${activeTab === "receipt" ? ", and change" : ""}`} checked={settings.showPaymentDetails} onCheckedChange={(v) => set("showPaymentDetails", v)} />
          <ToggleRow label="Show item SKU" description="Product SKU code in item list" checked={settings.showItemSku} onCheckedChange={(v) => set("showItemSku", v)} />
          <ToggleRow label="Show QR code" description="Scannable order verification code" checked={settings.showQR} onCheckedChange={(v) => set("showQR", v)} />
          <ToggleRow label="Show barcode" description={`${activeTab === "receipt" ? "Order barcode for returns processing" : "Order barcode for invoice tracking"}`} checked={settings.showBarcode} onCheckedChange={(v) => set("showBarcode", v)} />
        </div>
      </SettingsPanel>

      {/* Live preview */}
      <SettingsPanel
        title={`${activeTab === "receipt" ? "Receipt" : "Invoice"} preview`}
        description={`Exactly what your customers receive for ${activeTab === "receipt" ? "receipts" : "invoices"}`}
      >
        <div className="rounded-xl bg-muted/40 p-5">
          <div className="flex justify-center overflow-x-auto">
            <ReceiptComponent data={sampleData} settings={settings} documentType={activeTab} />
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Sample data — the real {activeTab === "receipt" ? "receipt" : "invoice"} is generated from each {activeTab === "receipt" ? "sale" : "billing"} at checkout.
        </p>
      </SettingsPanel>
    </div>
  );
}

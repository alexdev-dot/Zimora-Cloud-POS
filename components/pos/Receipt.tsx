"use client";

import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { Barcode } from "@/components/shared/Barcode";
import { PAYMENT_META } from "@/lib/constants";
import { business, defaultReceiptSettings } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import type { PaymentMethod, ReceiptSettings } from "@/types";

export interface ReceiptData {
  orderNo: string;
  date: string;
  cashier: string;
  customerName?: string;
  items: { name: string; sku?: string; qty: number; unitPrice: number }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentRef?: string;
  amountReceived?: number;
  change?: number;
  splits?: { method: PaymentMethod; amount: number }[];
}

const kes = (n: number) =>
  "KSh " + n.toLocaleString("en-US", { minimumFractionDigits: n % 1 === 0 ? 0 : 2 });

/**
 * Printable receipt. Multiple template styles — used by the POS
 * success modal, the sale detail drawer and the receipt-template designer.
 */
export function Receipt({
  data,
  settings = defaultReceiptSettings,
  className,
  documentType = "receipt",
}: {
  data: ReceiptData;
  settings?: ReceiptSettings;
  className?: string;
  documentType?: "receipt" | "invoice";
}) {
  const is58 = settings.width === "58mm";
  const isInvoice = documentType === "invoice";
  const mono = settings.template === "classic";
  const isModern = settings.template === "modern";
  const isBold = settings.template === "bold";
  const isElegant = settings.template === "elegant";
  const isProfessional = settings.template === "professional";
  const isInvoiceModern = isInvoice && isModern;
  const isInvoiceProfessional = isInvoice && isProfessional;

  return (
    <div
      className={cn(
        "mx-auto bg-white text-slate-900 shadow-sm ring-1 ring-slate-200",
        isInvoice ? "w-full max-w-[400px] font-sans text-[11px] leading-relaxed p-6 sm:w-[400px]" : (is58 ? "w-[248px] max-w-full" : "w-[320px] max-w-full"),
        !isInvoice && (mono ? "font-mono text-[11px] leading-relaxed p-5" : "font-sans text-[11.5px] leading-relaxed"),
        !isInvoice && isModern && "font-sans text-[11.5px] leading-relaxed p-5",
        !isInvoice && settings.template === "minimal" && "font-sans text-[12px] p-4",
        !isInvoice && isProfessional && "font-sans text-[11px] leading-relaxed p-6 border-2 border-slate-800",
        !isInvoice && isElegant && "font-sans text-[11px] leading-relaxed p-6 bg-gradient-to-b from-slate-50 to-white",
        !isInvoice && isBold && "font-sans text-[12px] leading-relaxed p-5",
        isInvoiceProfessional && "border-2 border-slate-800",
        isInvoice && isElegant && "bg-gradient-to-b from-slate-50 to-white border border-slate-200",
        isInvoiceModern && "border border-slate-300",
        className
      )}
    >
      {/* Header */}
      {isInvoice ? (
        <div className={cn("flex flex-col sm:flex-row justify-between items-start mb-4 gap-4", isElegant && "border-b border-slate-200 pb-4")}>
          <div className="flex-1">
            {settings.showLogo && (
              <div className={cn("mb-2 flex size-12 items-center justify-center overflow-hidden rounded-lg", isElegant && "size-14 ring-2 ring-slate-200")}>
                <Image
                  src="/logo.png"
                  alt={`${business.name} logo`}
                  width={558}
                  height={447}
                  className="size-full object-contain"
                  loading="eager"
                />
              </div>
            )}
            <p className={cn("font-bold text-slate-800", isInvoiceProfessional ? "text-[16px]" : isInvoiceModern ? "text-[17px]" : "text-[17px]")}>{business.name || "Your Business Name"}</p>
            {settings.showBusinessInfo && (
              <>
                <p className="text-[10px] text-slate-600 mt-1">{business.address || "Business Address"}</p>
                <p className="text-[10px] text-slate-600">
                  Tel {business.phone || "Phone"} · PIN {business.kraPin || "Tax PIN"}
                </p>
              </>
            )}
          </div>
          <div className="text-right sm:text-right">
            {settings.headerMessage && (
              <p className={cn("font-bold text-slate-500 uppercase tracking-wide mb-1", isElegant && "italic text-slate-400")}>
                {settings.headerMessage}
              </p>
            )}
            {settings.documentTitle && (
              <p className={cn("font-bold text-slate-800 uppercase tracking-wide mb-2", isInvoiceProfessional ? "text-[18px]" : isInvoiceModern ? "text-[19px]" : "text-[19px]")}>
                {settings.documentTitle}
              </p>
            )}
            <div className="text-[10px] text-slate-600 space-y-0.5">
              <p><span className="font-semibold">Invoice #:</span> {data.orderNo}</p>
              <p><span className="font-semibold">Date:</span> {formatDate(data.date, true)}</p>
              {settings.showCashier && <p><span className="font-semibold">Sales Rep:</span> {data.cashier}</p>}
            </div>
          </div>
        </div>
      ) : (
        <div className={cn(
          "text-center",
          settings.template === "minimal" && "text-left",
          isModern && "text-center",
          isProfessional && "text-left border-b-2 border-slate-800 pb-3 mb-3",
          isElegant && "text-center"
        )}>
          {settings.showLogo && (
            <div
              className={cn(
                "mx-auto mb-2 flex size-10 items-center justify-center overflow-hidden rounded-lg",
                settings.template === "minimal" && "mx-0",
                isProfessional && "mx-0 size-12",
                isElegant && "mx-auto size-14 ring-2 ring-slate-200"
              )}
            >
              <Image
                src="/logo.png"
                alt={`${business.name} logo`}
                width={558}
                height={447}
                className="size-full object-contain"
                loading="eager"
              />
            </div>
          )}
          {settings.headerMessage && (
            <p className={cn(
              "font-bold uppercase tracking-wide",
              mono ? "text-[10px] text-slate-500 mb-1" : "text-[11px] text-slate-500 mb-1",
              isModern && "text-[11px] text-slate-500 mb-1",
              isBold && "text-[12px] text-slate-600 mb-2",
              isProfessional && "text-[10px] text-slate-400 mb-2",
              isElegant && "text-[11px] text-slate-400 mb-2 italic"
            )}>
              {settings.headerMessage}
            </p>
          )}
          {settings.documentTitle && (
            <p className={cn(
              "font-bold uppercase tracking-wide",
              mono ? "text-[13px]" : "text-[13.5px]",
              isModern && "text-[13.5px]",
              isBold && "text-[16px] text-slate-800",
              isProfessional && "text-[14px] text-slate-800",
              isElegant && "text-[15px] text-slate-700"
            )}>
              {settings.documentTitle}
            </p>
          )}
          <p className={cn(
            "font-bold uppercase tracking-wide",
            mono ? "text-[13px]" : "text-[13.5px]",
            isModern && "text-[13.5px]",
            isBold && "text-[16px] text-slate-800",
            isProfessional && "text-[14px] text-slate-800",
            isElegant && "text-[15px] text-slate-700"
          )}>
            {business.name || "Your Business Name"}
          </p>
          {settings.showBusinessInfo && (
            <>
              <p className="text-[10px] text-slate-500">{business.address || "Business Address"}</p>
              <p className="text-[10px] text-slate-500">
                Tel {business.phone || "Phone"} · PIN {business.kraPin || "Tax PIN"}
              </p>
            </>
          )}
        </div>
      )}

      <Divider template={settings.template} isInvoice={isInvoice} />

      {/* Meta */}
      {isInvoice ? (
        <div className="mb-4">
          {settings.showCustomer && data.customerName && data.customerName !== "Walk-in Customer" && (
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <p className="font-semibold text-[10px] text-slate-700 uppercase tracking-wide mb-1">Bill To</p>
              <p className="text-[11px] text-slate-800 font-medium">{data.customerName}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-0.5">
          <Row l={documentType === "receipt" ? "Receipt" : "Invoice"} r={data.orderNo} strong />
          <Row l="Date" r={formatDate(data.date, true)} />
          {settings.showCashier && <Row l="Served by" r={data.cashier} />}
          {settings.showCustomer && data.customerName && data.customerName !== "Walk-in Customer" && (
            <Row l="Customer" r={data.customerName} />
          )}
        </div>
      )}

      <Divider template={settings.template} isInvoice={isInvoice} />

      {/* Items */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[300px]">
          <thead>
            <tr className={cn(
              "text-left text-[10px] uppercase tracking-wide",
              isInvoiceProfessional && "text-slate-700 font-semibold border-b-2 border-slate-800 bg-slate-50",
              isInvoice && isElegant && "text-slate-500 font-semibold border-b border-slate-200",
              isInvoiceModern && "text-slate-600 font-semibold border-b-2 border-slate-900/80 bg-slate-50",
              !isInvoice && (mono ? "text-slate-500" : "text-slate-500"),
              !isInvoice && isModern && "text-slate-500",
              !isInvoice && isBold && "text-slate-600 font-semibold",
              !isInvoice && isProfessional && "text-slate-700 font-semibold border-b border-slate-300",
              !isInvoice && isElegant && "text-slate-500 border-b border-slate-200"
            )}>
              <th className={cn("pb-1 font-semibold", isInvoice && "py-2 px-2", !isInvoice && isModern && "pb-1", !isInvoice && isProfessional && "pb-2")}>Item</th>
              {settings.showItemSku && <th className={cn("pb-1 font-semibold", isInvoice && "py-2 px-2", !isInvoice && isModern && "pb-1", !isInvoice && isProfessional && "pb-2")}>SKU</th>}
              <th className={cn("pb-1 text-center font-semibold", isInvoice && "py-2 px-2", !isInvoice && isModern && "pb-1", !isInvoice && isProfessional && "pb-2")}>Qty</th>
              {isInvoice && <th className={cn("pb-1 text-right font-semibold", "py-2 px-2")}>Price</th>}
              <th className={cn("pb-1 text-right font-semibold", isInvoice && "py-2 px-2", !isInvoice && isModern && "pb-1", !isInvoice && isProfessional && "pb-2")}>{isInvoice ? "Total" : "Amt"}</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i} className={cn(
                "align-top",
                isInvoice && "border-b border-slate-200",
                !isInvoice && isModern && "py-0.5",
                !isInvoice && isProfessional && "border-b border-slate-100",
                !isInvoice && isElegant && "border-b border-slate-50"
              )}>
                <td className={cn("py-0.5 pr-1", isInvoice && "py-2 px-2", !isInvoice && isModern && "py-0.5", !isInvoice && isProfessional && "py-2")}>
                  {item.name}
                  {!mono && !isInvoice && (
                    <span className="block text-[10px] text-slate-400">
                      {kes(item.unitPrice)} each
                    </span>
                  )}
                </td>
                {settings.showItemSku && (
                  <td className={cn("py-0.5 text-center text-[10px] text-slate-400", isInvoice && "py-2 px-2", !isInvoice && isModern && "py-0.5", !isInvoice && isProfessional && "py-2")}>
                    {item.sku || "N/A"}
                  </td>
                )}
                <td className={cn("py-0.5 text-center tabular-nums", isInvoice && "py-2 px-2", !isInvoice && isModern && "py-0.5", !isInvoice && isProfessional && "py-2")}>{item.qty}</td>
                {isInvoice && <td className={cn("py-0.5 text-right tabular-nums", "py-2 px-2")}>{kes(item.unitPrice)}</td>}
                <td className={cn("py-0.5 text-right tabular-nums", isInvoice && "py-2 px-2", !isInvoice && isModern && "py-0.5", !isInvoice && isProfessional && "py-2")}>{kes(item.qty * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Divider template={settings.template} isInvoice={isInvoice} />

      {/* Totals */}
      {isInvoice ? (
        <div className={cn("mt-4 ml-auto w-48 space-y-1", isElegant && "bg-slate-50 p-3 rounded-lg border border-slate-200", "sm:w-48 w-full")}>
          <Row l="Subtotal" r={kes(data.subtotal)} />
          {data.discount > 0 && <Row l="Discount" r={"−" + kes(data.discount)} />}
          {settings.showTax && <Row l="VAT (16%)" r={kes(data.tax)} />}
          <div className={cn(
            "flex justify-between border-t pt-2 font-bold text-[14px]",
            isInvoiceProfessional && "border-t-2 border-slate-800",
            isInvoiceModern && "border-t-2 border-slate-900/80",
            isElegant && "border-t border-slate-600"
          )}>
            <span>TOTAL</span>
            <span className="tabular-nums">{kes(data.total)}</span>
          </div>
          {settings.showPaymentDetails && (
            <div className="pt-2 space-y-1">
              {data.splits && data.splits.length > 0 ? (
                data.splits.map((s, i) => (
                  <Row key={i} l={`${PAYMENT_META[s.method].label} payment`} r={kes(s.amount)} />
                ))
              ) : (
                <Row l={`Paid — ${PAYMENT_META[data.paymentMethod].label}`} r={kes(data.amountReceived ?? data.total)} />
              )}
              {data.paymentRef && <Row l="Ref" r={data.paymentRef} />}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          <Row l="Subtotal" r={kes(data.subtotal)} />
          {data.discount > 0 && <Row l="Discount" r={"−" + kes(data.discount)} />}
          {settings.showTax && <Row l="VAT (16%)" r={kes(data.tax)} />}
          <div className={cn(
            "flex justify-between border-t pt-1.5 font-bold",
            mono ? "border-slate-300 text-[14px]" : "border-slate-300 text-[14px]",
            isModern && "border-slate-900/80 text-[14px]",
            isBold && "border-slate-800 text-[16px]",
            isProfessional && "border-2 border-slate-800 text-[15px] pt-2",
            isElegant && "border-slate-600 text-[15px] pt-2"
          )}>
            <span className={cn(mono ? "text-[12px]" : "", isModern && "text-[12px]", isBold && "text-slate-800")}>TOTAL</span>
            <span className="tabular-nums">{kes(data.total)}</span>
          </div>
          <div className="pt-1" />
          {settings.showPaymentDetails && (
            <>
              {data.splits && data.splits.length > 0 ? (
                data.splits.map((s, i) => (
                  <Row key={i} l={`${PAYMENT_META[s.method].label} payment`} r={kes(s.amount)} />
                ))
              ) : (
                <Row l={`Paid — ${PAYMENT_META[data.paymentMethod].label}`} r={kes(data.amountReceived ?? data.total)} />
              )}
              {data.paymentRef && <Row l="Ref" r={data.paymentRef} />}
              {data.change !== undefined && data.change > 0 && (
                <Row l="Change" r={kes(data.change)} strong />
              )}
            </>
          )}
        </div>
      )}

      <Divider template={settings.template} isInvoice={isInvoice} />

      {/* Footer */}
      <div className={cn("text-center", settings.template === "minimal" && "text-left", isInvoice && "text-left mt-4")}>
        {settings.showQR && (
          <div className={cn("mb-2 flex justify-center", settings.template === "minimal" && "justify-start", isInvoice && "justify-start")}>
            <div className="rounded border border-slate-200 bg-white p-1">
              <QRCodeSVG
                value={`ZIMORA|${data.orderNo}|${data.total}|${new Date(data.date).toISOString()}`}
                size={is58 ? 52 : 60}
              />
            </div>
          </div>
        )}
        {settings.showBarcode && (
          <div className={cn("mb-2 flex justify-center", isInvoice && "justify-start")}>
            <Barcode value={data.orderNo} height={32} format="CODE128" />
          </div>
        )}
        {settings.footer.split("\n").map((line, i) => (
          <p key={i} className="text-[10px] text-slate-600">
            {line}
          </p>
        ))}
        <p className="mt-2 text-[9px] uppercase tracking-widest text-slate-400">
          Powered by Zimora Cloud POS
        </p>
      </div>
    </div>
  );
}

function Row({ l, r, strong }: { l: string; r: string; strong?: boolean }) {
  return (
    <div className={cn("flex justify-between gap-2", strong && "font-bold")}>
      <span className="text-slate-600">{l}</span>
      <span className="tabular-nums">{r}</span>
    </div>
  );
}

function Divider({ template, isInvoice }: { template: ReceiptSettings["template"]; isInvoice?: boolean }) {
  if (isInvoice) {
    if (template === "professional") return <div className="my-4 border-t border-slate-300" />;
    if (template === "modern") return <div className="my-3 border-t-2 border-slate-900/80" />;
    if (template === "elegant") return <div className="my-4 border-t border-slate-200" />;
    return <div className="my-4 border-t border-slate-200" />;
  }
  if (template === "minimal") return <div className="my-3 border-t border-slate-200" />;
  if (template === "modern") return <div className="my-2.5 border-t-2 border-slate-900/80" />;
  if (template === "professional") return <div className="my-3 border-t border-slate-300" />;
  if (template === "elegant") return <div className="my-3 border-t border-slate-200" />;
  if (template === "bold") return <div className="my-2.5 border-t-2 border-slate-800" />;
  return <div className="my-2 border-t border-dashed border-slate-400" />;
}

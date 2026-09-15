"use client";

import * as React from "react";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Loader2,
  Plus,
  Smartphone,
  Split,
  Trash2,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField, Input, NativeSelect } from "@/components/ui/input";
import { formatKES, cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types";

export interface PaymentResult {
  method: PaymentMethod;
  amountReceived?: number;
  change?: number;
  phone?: string;
  paymentRef?: string;
  splits?: { method: PaymentMethod; amount: number }[];
}

const METHODS: { id: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "mpesa", label: "M-Pesa", icon: Smartphone },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "split", label: "Split", icon: Split },
];

function makeRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function PaymentDialog({
  open,
  onOpenChange,
  total,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  onComplete: (result: PaymentResult) => void;
}) {
  const [method, setMethod] = React.useState<PaymentMethod>("cash");

  // Cash
  const [received, setReceived] = React.useState<string>("");
  // M-Pesa
  const [phone, setPhone] = React.useState("");
  const [stage, setStage] = React.useState<"idle" | "sending" | "awaiting" | "paid">("idle");
  // Card
  const [cardStage, setCardStage] = React.useState<"idle" | "processing" | "approved">("idle");
  // Split
  const [splits, setSplits] = React.useState<{ method: PaymentMethod; amount: string }[]>([
    { method: "cash", amount: "" },
    { method: "mpesa", amount: "" },
  ]);

  React.useEffect(() => {
    if (open) {
      setMethod("cash");
      setReceived("");
      setPhone("");
      setStage("idle");
      setCardStage("idle");
      setSplits([
        { method: "cash", amount: "" },
        { method: "mpesa", amount: "" },
      ]);
    }
  }, [open]);

  const receivedNum = parseFloat(received) || 0;
  const change = receivedNum - total;
  const cashOk = receivedNum >= total && total > 0;
  const phoneOk = /^(?:\+?254|0)7\d{8}$/.test(phone.replace(/\s/g, ""));
  const splitSum = splits.reduce((a, s) => a + (parseFloat(s.amount) || 0), 0);
  const splitRemaining = Math.round((total - splitSum) * 100) / 100;
  const splitOk = total > 0 && splitRemaining === 0 && splits.every((s) => (parseFloat(s.amount) || 0) > 0);
  const canComplete =
    (method === "cash" && cashOk) ||
    (method === "mpesa" && stage === "paid") ||
    (method === "card" && cardStage === "approved") ||
    (method === "split" && splitOk);

  function sendStkPush() {
    setStage("sending");
    setTimeout(() => setStage("awaiting"), 900);
    setTimeout(() => setStage("paid"), 3400);
  }

  function processCard() {
    setCardStage("processing");
    setTimeout(() => setCardStage("approved"), 1700);
  }

  function complete() {
    if (method === "cash") {
      onComplete({ method: "cash", amountReceived: receivedNum, change });
    } else if (method === "mpesa") {
      onComplete({ method: "mpesa", phone, paymentRef: makeRef(), amountReceived: total });
    } else if (method === "card") {
      onComplete({ method: "card", paymentRef: makeRef().slice(0, 6), amountReceived: total });
    } else {
      onComplete({
        method: "split",
        splits: splits.map((s) => ({ method: s.method, amount: parseFloat(s.amount) || 0 })),
        paymentRef: makeRef(),
        amountReceived: total,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Take payment</DialogTitle>
          <DialogDescription>Collect KSh {total.toLocaleString()} to complete this sale</DialogDescription>
          <p className="mt-2 text-[28px] font-semibold tracking-tight tabular-nums">{formatKES(total)}</p>
        </DialogHeader>

        <DialogBody>
          {/* Method selector */}
          <div role="radiogroup" aria-label="Payment method" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {METHODS.map((m) => (
              <button
                key={m.id}
                role="radio"
                aria-checked={method === m.id}
                onClick={() => setMethod(m.id)}
                className={cn(
                  "focus-ring flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition-all",
                  method === m.id
                    ? "border-primary bg-accent text-primary shadow-sm"
                    : "border-border text-muted-foreground hover:border-slate-300 hover:bg-muted/60"
                )}
              >
                <m.icon className="size-[18px]" />
                {m.label}
              </button>
            ))}
          </div>

          <div className="mt-4">
            {method === "cash" && (
              <div className="space-y-3">
                <FormField label="Amount received" htmlFor="pos-cash-received" required>
                  <Input
                    id="pos-cash-received"
                    inputMode="decimal"
                    placeholder="0"
                    value={received}
                    onChange={(e) => setReceived(e.target.value)}
                    aria-invalid={received !== "" && receivedNum < total}
                    className="h-11 text-lg font-semibold tabular-nums"
                  />
                </FormField>
                <div className="flex flex-wrap gap-1.5">
                  {[total, 5000, 1000, 500, 200, 100, 50].map((amt, i) => (
                    <button
                      key={`${amt}-${i}`}
                      onClick={() => setReceived(String(amt))}
                      className="focus-ring rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium tabular-nums transition-colors hover:bg-muted"
                    >
                      {i === 0 ? "Exact" : amt.toLocaleString()}
                    </button>
                  ))}
                </div>
                <div
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-3.5 py-3",
                    received === ""
                      ? "border-border bg-muted/40"
                      : change >= 0
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-red-200 bg-red-50"
                  )}
                >
                  <span className="text-[13px] font-medium text-muted-foreground">
                    {change >= 0 ? "Change due" : "Balance remaining"}
                  </span>
                  <span
                    className={cn(
                      "text-lg font-semibold tabular-nums",
                      received === "" ? "text-foreground" : change >= 0 ? "text-emerald-700" : "text-red-700"
                    )}
                  >
                    {received === "" ? "—" : formatKES(Math.abs(change))}
                  </span>
                </div>
              </div>
            )}

            {method === "mpesa" && (
              <div className="space-y-3">
                <FormField
                  label="Customer phone number"
                  htmlFor="pos-mpesa-phone"
                  required
                  hint="Safaricom number — an STK push prompt is sent to this phone"
                >
                  <Input
                    id="pos-mpesa-phone"
                    inputMode="tel"
                    placeholder="07XX XXX XXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    aria-invalid={phone !== "" && !phoneOk}
                  />
                </FormField>
                {stage === "idle" && (
                  <Button className="w-full" disabled={!phoneOk} onClick={sendStkPush}>
                    <Smartphone /> Send STK Push
                  </Button>
                )}
                {stage === "sending" && (
                  <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/40 py-3 text-[13px] text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" /> Sending prompt to {phone}…
                  </div>
                )}
                {stage === "awaiting" && (
                  <div className="rounded-lg border border-sky-200 bg-sky-50 px-3.5 py-3 text-center">
                    <p className="flex items-center justify-center gap-2 text-[13px] font-medium text-sky-900">
                      <span className="relative flex size-2.5">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-sky-500 opacity-60" />
                        <span className="relative inline-flex size-2.5 rounded-full bg-sky-600" />
                      </span>
                      Waiting for customer PIN
                    </p>
                    <p className="mt-1 text-xs text-sky-700">
                      {phone} should receive an M-Pesa prompt for {formatKES(total)}
                    </p>
                  </div>
                )}
                {stage === "paid" && (
                  <div className="flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3">
                    <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-emerald-800">M-Pesa payment received</p>
                      <p className="text-xs text-emerald-700">Confirmed · {formatKES(total)} from {phone}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {method === "card" && (
              <div className="space-y-3">
                <div className="rounded-lg border border-border bg-muted/40 px-4 py-6 text-center">
                  <CreditCard className="mx-auto size-8 text-slate-400" />
                  <p className="mt-2 text-[13px] font-medium">
                    {cardStage === "idle" && "Tap, insert or swipe card on the terminal"}
                    {cardStage === "processing" && "Processing on terminal…"}
                    {cardStage === "approved" && "Card approved"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {cardStage === "approved"
                      ? `Auth code ${makeRef().slice(0, 6)} · Visa ••4821`
                      : `Amount ${formatKES(total)}`}
                  </p>
                  {cardStage === "processing" && (
                    <Loader2 className="mx-auto mt-3 size-4 animate-spin text-primary" />
                  )}
                  {cardStage === "approved" && (
                    <CheckCircle2 className="mx-auto mt-3 size-5 animate-pop-check text-emerald-600" />
                  )}
                </div>
                {cardStage === "idle" && (
                  <Button className="w-full" onClick={processCard}>
                    <CreditCard /> Charge {formatKES(total)}
                  </Button>
                )}
                {cardStage === "processing" && (
                  <Button className="w-full" variant="outline" onClick={() => setCardStage("idle")}>
                    <X /> Cancel
                  </Button>
                )}
              </div>
            )}

            {method === "split" && (
              <div className="space-y-2.5">
                {splits.map((s, i) => {
                  const otherMethods = METHODS.filter(
                    (m) => m.id !== "split" && !splits.some((o, j) => j !== i && o.method === m.id)
                  );
                  return (
                    <div key={i} className="flex items-end gap-2">
                      <FormField label={i === 0 ? "Method" : undefined} className="min-w-[118px] flex-1">
                        <NativeSelect
                          aria-label={`Payment method ${i + 1}`}
                          value={s.method}
                          onChange={(e) => {
                            const next = [...splits];
                            next[i] = { ...next[i], method: e.target.value as PaymentMethod };
                            setSplits(next);
                          }}
                        >
                          {METHODS.filter((m) => m.id !== "split").map((m) => (
                            <option key={m.id} value={m.id} disabled={!otherMethods.some((o) => o.id === m.id)}>
                              {m.label}
                            </option>
                          ))}
                        </NativeSelect>
                      </FormField>
                      <FormField label={i === 0 ? "Amount" : undefined} className="flex-1">
                        <Input
                          inputMode="decimal"
                          placeholder="0"
                          aria-label={`Amount for method ${i + 1}`}
                          value={s.amount}
                          onChange={(e) => {
                            const next = [...splits];
                            next[i] = { ...next[i], amount: e.target.value };
                            setSplits(next);
                          }}
                        />
                      </FormField>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove payment ${i + 1}`}
                        disabled={splits.length <= 2}
                        onClick={() => setSplits(splits.filter((_, j) => j !== i))}
                        className="mb-0.5 text-muted-foreground"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  );
                })}
                {splits.length < 3 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSplits([...splits, { method: "card", amount: String(Math.max(0, splitRemaining)) }])
                    }
                  >
                    <Plus /> Add payment
                  </Button>
                )}
                <div
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-3.5 py-2.5",
                    splitRemaining === 0
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-border bg-muted/40"
                  )}
                >
                  <span className="text-[13px] font-medium text-muted-foreground">Remaining</span>
                  <span
                    className={cn(
                      "font-semibold tabular-nums",
                      splitRemaining === 0 ? "text-emerald-700" : "text-foreground"
                    )}
                  >
                    {formatKES(splitRemaining)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Back to cart
          </Button>
          <Button size="lg" disabled={!canComplete} onClick={complete} className="min-w-[180px]">
            <CheckCircle2 /> Complete Sale · {formatKES(total)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

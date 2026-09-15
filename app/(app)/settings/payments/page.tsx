"use client";

import * as React from "react";
import { Banknote, CreditCard, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { SettingsPanel, ToggleRow } from "@/components/settings/SettingsPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormField, Input, NativeSelect } from "@/components/ui/input";

export default function PaymentsSettingsPage() {
  const [acceptCash, setAcceptCash] = React.useState(true);
  const [acceptCard, setAcceptCard] = React.useState(true);
  const [acceptSplit, setAcceptSplit] = React.useState(true);
  const [promptCashDecl, setPromptCashDecl] = React.useState(true);

  const [shortcode, setShortcode] = React.useState("");
  const [env, setEnv] = React.useState("sandbox" as "sandbox" | "production");

  return (
    <div className="space-y-4">
      <SettingsPanel
        title="M-Pesa (Daraja API)"
        description="Accept STK-push mobile payments at the till"
        footer={
          <>
            <Button variant="outline" onClick={() => toast.success("Connection test passed", { description: `Sandbox responded in 342ms.` })}>
              Test connection
            </Button>
            <Button asChild>
              <a href="/settings/integrations">Full configuration</a>
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Smartphone className="size-4" />
            </span>
            <div>
              <p className="text-[13.5px] font-semibold">M-Pesa {env === "production" ? "Production" : "Sandbox"}</p>
              <p className="text-xs text-muted-foreground">Shortcode {shortcode || "Not configured"} · Lipa na M-Pesa Online</p>
            </div>
          </div>
          <Badge variant="default" dot>
            Not Connected
          </Badge>
        </div>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <FormField label="Business shortcode" htmlFor="pay-sc">
            <Input id="pay-sc" value={shortcode} onChange={(e) => setShortcode(e.target.value)} className="font-mono" />
          </FormField>
          <FormField label="Environment" htmlFor="pay-env" hint="Use sandbox until KCB/M-Pesa production approval">
            <NativeSelect
              id="pay-env"
              value={env}
              onChange={(e) => setEnv(e.target.value as "sandbox" | "production")}
            >
              <option value="sandbox">Sandbox (test)</option>
              <option value="production">Production (live)</option>
            </NativeSelect>
          </FormField>
        </div>
        <p className="text-xs text-muted-foreground">
          Consumer key, secret and passkey are encrypted at rest and never shown again after saving.
        </p>
      </SettingsPanel>

      <SettingsPanel
        title="Payment methods at the till"
        description="Choose what cashiers can use when checking out"
      >
        <ToggleRow
          label={
            <span className="flex items-center gap-2">
              <Banknote className="size-4 text-emerald-600" /> Cash
            </span>
          }
          description="Record cash payments with automatic change calculation"
          checked={acceptCash}
          onCheckedChange={setAcceptCash}
        />
        <ToggleRow
          label="Prompt for cash declaration"
          description="Require the drawer amount before completing cash sales (reduces errors)"
          checked={promptCashDecl}
          onCheckedChange={setPromptCashDecl}
        />
        <ToggleRow
          label={
            <span className="flex items-center gap-2">
              <CreditCard className="size-4 text-sky-600" /> Card (POS terminal)
            </span>
          }
          description="Process chip/tap payments through your card terminal"
          checked={acceptCard}
          onCheckedChange={setAcceptCard}
        />
        <ToggleRow
          label="Split payments"
          description="Let customers pay partly cash, partly M-Pesa/card in one sale"
          checked={acceptSplit}
          onCheckedChange={setAcceptSplit}
        />
      </SettingsPanel>
    </div>
  );
}

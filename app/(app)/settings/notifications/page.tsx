"use client";

import * as React from "react";
import { toast } from "sonner";
import { SettingsPanel, ToggleRow } from "@/components/settings/SettingsPanel";
import { NativeSelect } from "@/components/ui/input";

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = React.useState({
    lowStockApp: true,
    lowStockSms: true,
    paymentApp: true,
    paymentSms: false,
    failedPaymentApp: true,
    refundApp: true,
    employeeApp: true,
    subscriptionEmail: true,
    systemEmail: false,
    dailyDigest: true,
  });

  function set(key: keyof typeof prefs, value: boolean) {
    setPrefs((p) => ({ ...p, [key]: value }));
  }

  return (
    <div className="space-y-4">
      <SettingsPanel title="Stock alerts" description="Never run out of your best sellers">
        <ToggleRow label="In-app low-stock alerts" description="Badge on the bell when products hit minimum stock" checked={prefs.lowStockApp} onCheckedChange={(v) => set("lowStockApp", v)} />
        <ToggleRow label="SMS to owner" description="Text when items run out completely" checked={prefs.lowStockSms} onCheckedChange={(v) => set("lowStockSms", v)} />
      </SettingsPanel>

      <SettingsPanel title="Payments & sales" description="Know the moment money moves">
        <ToggleRow label="Successful payments" description="M-Pesa confirmations and card approvals" checked={prefs.paymentApp} onCheckedChange={(v) => set("paymentApp", v)} />
        <ToggleRow label="Failed payments" description="Declined cards and cancelled STK pushes" checked={prefs.failedPaymentApp} onCheckedChange={(v) => set("failedPaymentApp", v)} />
        <ToggleRow label="Refunds processed" description="When a cashier issues a refund" checked={prefs.refundApp} onCheckedChange={(v) => set("refundApp", v)} />
      </SettingsPanel>

      <SettingsPanel title="Team & account" description="Workspace and billing updates">
        <ToggleRow label="Employee changes" description="New invites, deactivations and role changes" checked={prefs.employeeApp} onCheckedChange={(v) => set("employeeApp", v)} />
        <ToggleRow label="Subscription events" description="Renewal reminders, invoices and payment failures" checked={prefs.subscriptionEmail} onCheckedChange={(v) => set("subscriptionEmail", v)} />
        <ToggleRow label="System alerts" description="Backups, maintenance windows and incidents" checked={prefs.systemEmail} onCheckedChange={(v) => set("systemEmail", v)} />
      </SettingsPanel>

      <SettingsPanel
        title="Daily summary"
        description="One digest instead of a hundred pings"
        footer={undefined}
      >
        <ToggleRow label="End-of-day email" description="Sales, orders and expenses at closing time (8 PM)" checked={prefs.dailyDigest} onCheckedChange={(v) => set("dailyDigest", v)} />
        <div className="grid gap-3.5 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-[13px] font-medium">Send summary to</p>
            <NativeSelect defaultValue="owner" aria-label="Digest recipient">
              <option value="owner">Owner</option>
              <option value="managers">Owner + all managers</option>
              <option value="custom">Custom list…</option>
            </NativeSelect>
          </div>
          <div>
            <p className="mb-1.5 text-[13px] font-medium">Delivery time</p>
            <NativeSelect defaultValue="20:00" aria-label="Digest time">
              <option value="20:00">8:00 PM EAT</option>
              <option value="21:00">9:00 PM EAT</option>
              <option value="06:00">6:00 AM EAT (previous day)</option>
            </NativeSelect>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Changes save automatically.{" "}
          <button className="font-medium text-primary hover:underline" onClick={() => toast.success("Test notification sent")}>
            Send a test notification
          </button>
        </p>
      </SettingsPanel>
    </div>
  );
}

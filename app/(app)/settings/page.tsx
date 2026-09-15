"use client";

import * as React from "react";
import { Globe2, Save } from "lucide-react";
import { toast } from "sonner";
import { SettingsPanel, ToggleRow } from "@/components/settings/SettingsPanel";
import { FormField, NativeSelect } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function GeneralSettingsPage() {
  const [currency, setCurrency] = React.useState("KES");
  const [country, setCountry] = React.useState("Kenya");
  const [timezone, setTimezone] = React.useState("Africa/Nairobi");
  const [dateFormat, setDateFormat] = React.useState("DD MMM YYYY");
  const [numberFormat, setNumberFormat] = React.useState("1,234.56");
  const [taxInclusive, setTaxInclusive] = React.useState(false);
  const [weekStart, setWeekStart] = React.useState("Monday");

  return (
    <div className="space-y-4">
      <SettingsPanel
        title="Regional"
        description="Currency, locale and formatting used across the app, receipts and reports"
        footer={
          <Button
            onClick={() =>
              toast.success("Regional settings saved", { description: `Currency ${currency} · ${timezone}` })
            }
          >
            <Save /> Save changes
          </Button>
        }
      >
        <div className="grid gap-3.5 sm:grid-cols-2">
          <FormField label="Currency" htmlFor="gen-currency" hint="Prices display as KSh across the app">
            <NativeSelect id="gen-currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="KES">KES — Kenyan Shilling (KSh)</option>
              <option value="UGX">UGX — Ugandan Shilling</option>
              <option value="TZS">TZS — Tanzanian Shilling</option>
              <option value="USD">USD — US Dollar</option>
            </NativeSelect>
          </FormField>
          <FormField label="Country" htmlFor="gen-country">
            <NativeSelect id="gen-country" value={country} onChange={(e) => setCountry(e.target.value)}>
              <option>Kenya</option>
              <option>Uganda</option>
              <option>Tanzania</option>
              <option>Rwanda</option>
            </NativeSelect>
          </FormField>
          <FormField label="Timezone" htmlFor="gen-tz">
            <NativeSelect id="gen-tz" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
              <option value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3)</option>
              <option value="Africa/Kampala">Africa/Kampala (EAT, UTC+3)</option>
              <option value="Africa/Dar_es_Salaam">Africa/Dar_es_Salaam (EAT, UTC+3)</option>
            </NativeSelect>
          </FormField>
          <FormField label="Week starts on" htmlFor="gen-week">
            <NativeSelect id="gen-week" value={weekStart} onChange={(e) => setWeekStart(e.target.value)}>
              <option>Monday</option>
              <option>Sunday</option>
              <option>Saturday</option>
            </NativeSelect>
          </FormField>
          <FormField label="Date format" htmlFor="gen-date">
            <NativeSelect id="gen-date" value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
              <option value="DD MMM YYYY">12 Sep 2025</option>
              <option value="DD/MM/YYYY">12/09/2025</option>
              <option value="MM/DD/YYYY">09/12/2025</option>
              <option value="YYYY-MM-DD">2025-09-12</option>
            </NativeSelect>
          </FormField>
          <FormField label="Number format" htmlFor="gen-number" hint="How thousands and decimals are shown">
            <NativeSelect id="gen-number" value={numberFormat} onChange={(e) => setNumberFormat(e.target.value)}>
              <option value="1,234.56">1,234.56</option>
              <option value="1.234,56">1.234,56</option>
              <option value="1 234,56">1 234,56</option>
            </NativeSelect>
          </FormField>
        </div>
      </SettingsPanel>

      <SettingsPanel title="Taxes" description="How tax is applied at the till">
        <ToggleRow
          label="Prices include tax"
          description="When off, VAT (16%) is added on top of shelf prices at checkout"
          checked={taxInclusive}
          onCheckedChange={setTaxInclusive}
        />
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3.5 py-3">
          <div>
            <p className="text-[13.5px] font-medium">Tax rates</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              VAT Standard 16% · Zero-rated food 0% · Hospitality 8% (inactive)
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <a href="/settings/taxes">Manage rates</a>
          </Button>
        </div>
      </SettingsPanel>

      <SettingsPanel title="Receipt defaults" description="What prints after every sale">
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3.5 py-3">
          <div>
            <p className="text-[13.5px] font-medium">Receipt and Invoice templates</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Design templates, logo, QR codes and footer messages</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <a href="/settings/receipts">Open designer</a>
          </Button>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Globe2 className="size-3.5" /> Regional defaults apply to all branches — branch managers can request changes.
        </p>
      </SettingsPanel>
    </div>
  );
}

"use client";

import * as React from "react";
import { Percent, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { SettingsPanel, ToggleRow } from "@/components/settings/SettingsPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormField, Input, NativeSelect } from "@/components/ui/input";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { uid } from "@/lib/utils";

export default function TaxesSettingsPage() {
  const [rates, setRates] = React.useState<any[]>([]);
  const [inclusive, setInclusive] = React.useState(false);
  const [addOpen, setAddOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [rate, setRate] = React.useState("");
  const [applies, setApplies] = React.useState("All products");

  function add() {
    if (!name.trim() || rate === "") {
      toast.error("Tax name and percentage are required");
      return;
    }
    setRates((prev) => [
      ...prev,
      { id: uid("t"), name: name.trim(), rate: parseFloat(rate), appliesTo: applies, status: "active" as const, enabled: true },
    ]);
    setAddOpen(false);
    setName("");
    setRate("");
    toast.success("Tax rate added", { description: `${name} at ${rate}%` });
  }

  return (
    <div className="space-y-4">
      <SettingsPanel
        title="Tax rates"
        description="Rates applied to products at checkout and on receipts"
        footer={
          <>
            <Button variant="outline" onClick={() => setAddOpen(true)}>
              <Plus /> Add tax rate
            </Button>
            <Button onClick={() => toast.success("Tax settings saved")}>
              <Save /> Save changes
            </Button>
          </>
        }
      >
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-2 text-left text-sm font-medium">Tax name</th>
                <th className="px-4 py-2 text-right text-sm font-medium">Rate</th>
                <th className="hidden px-4 py-2 text-left text-sm font-medium sm:table-cell">Applies to</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((t) => (
                <tr key={t.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-2 font-medium">{t.name}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{t.rate}%</td>
                  <td className="hidden px-4 py-2 text-muted-foreground sm:table-cell">{t.appliesTo}</td>
                  <td className="px-4 py-2">
                    <Badge variant={t.enabled ? "success" : "default"} dot>
                      {t.enabled ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ToggleRow
          label="Prices include tax (tax-inclusive pricing)"
          description="Shelf prices already contain VAT; receipts show the VAT portion separately"
          checked={inclusive}
          onCheckedChange={setInclusive}
        />
        <div className="rounded-lg border border-border bg-muted/30 px-3.5 py-3 text-[13px] text-muted-foreground">
          <p className="flex items-center gap-1.5 font-medium text-foreground">
            <Percent className="size-3.5" /> Example — KSh 1,000 sale
          </p>
          <p className="mt-1">
            {inclusive
              ? "Tax-inclusive: customer pays KSh 1,000 · VAT portion KSh 137.93 · net KSh 862.07"
              : "Tax-exclusive: shelf price KSh 1,000 + VAT KSh 160 = customer pays KSh 1,160"}
          </p>
        </div>
      </SettingsPanel>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Add tax rate</DialogTitle>
            <DialogDescription>Create an additional tax rate</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3.5">
            <FormField label="Tax name" htmlFor="tax-name" required>
              <Input id="tax-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. VAT Reduced" />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Percentage" htmlFor="tax-rate" required>
                <Input
                  id="tax-rate"
                  inputMode="decimal"
                  value={rate}
                  onChange={(e) => setRate(e.target.value.replace(/[^0-9.]/g, ""))}
                  placeholder="16"
                  className="tabular-nums"
                />
              </FormField>
              <FormField label="Applies to" htmlFor="tax-applies">
                <NativeSelect id="tax-applies" value={applies} onChange={(e) => setApplies(e.target.value)}>
                  <option>All products</option>
                  <option>Selected categories</option>
                  <option>Services only</option>
                </NativeSelect>
              </FormField>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={add}>Add rate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import * as React from "react";
import { Building2, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { FormField, Input, NativeSelect } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/layout/SidebarNav";

export default function BusinessSettingsPage() {
  const [name, setName] = React.useState("");
  const [legalName, setLegalName] = React.useState("");
  const [type, setType] = React.useState("Supermarket");
  const [kraPin, setKraPin] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [website, setWebsite] = React.useState("");

  return (
    <div className="space-y-4">
      <SettingsPanel
        title="Business profile"
        description="Appears on receipts, invoices and reports"
        footer={
          <Button onClick={() => toast.success("Business profile saved")}>
            <Save /> Save changes
          </Button>
        }
      >
        <div className="flex items-center gap-4">
          <span className="flex size-16 items-center justify-center rounded-xl border border-border bg-white shadow-card">
            <BrandMark className="size-9" />
          </span>
          <div className="space-y-1.5">
            <p className="text-[13.5px] font-medium">Business logo</p>
            <p className="text-xs text-muted-foreground">PNG or SVG, square. Shown on receipts and the sidebar.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Logo upload", { description: "Connect storage to enable uploads." })}
            >
              <Upload /> Upload logo
            </Button>
          </div>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <FormField label="Business name" htmlFor="bz-name" required>
            <Input id="bz-name" value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField label="Registered name" htmlFor="bz-legal" hint="As registered with the registrar of companies">
            <Input id="bz-legal" value={legalName} onChange={(e) => setLegalName(e.target.value)} />
          </FormField>
          <FormField label="Business type" htmlFor="bz-type">
            <NativeSelect id="bz-type" value={type} onChange={(e) => setType(e.target.value)}>
              <option>Supermarket</option>
              <option>Retail shop</option>
              <option>Restaurant</option>
              <option>Pharmacy</option>
              <option>Hardware store</option>
              <option>Electronics shop</option>
            </NativeSelect>
          </FormField>
          <FormField label="KRA PIN" htmlFor="bz-pin" hint="Shown on eTIMS-compatible receipts">
            <Input id="bz-pin" value={kraPin} onChange={(e) => setKraPin(e.target.value)} className="font-mono" />
          </FormField>
          <FormField label="Business email" htmlFor="bz-email">
            <Input id="bz-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormField>
          <FormField label="Phone" htmlFor="bz-phone">
            <Input id="bz-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </FormField>
          <FormField label="Physical address" htmlFor="bz-address" className="sm:col-span-2">
            <Input id="bz-address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </FormField>
          <FormField label="Website" htmlFor="bz-web">
            <Input id="bz-web" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </FormField>
        </div>
      </SettingsPanel>

      <SettingsPanel title="Plan & billing" description="Your Zimora Cloud POS subscription">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-accent/50 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="size-4" />
            </span>
            <div>
              <p className="text-[13.5px] font-semibold">Growth Plan</p>
              <p className="text-xs text-muted-foreground">
                KSh 4,900/month · 3 locations · unlimited users · renews 15 Sep 2025
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.info("Invoice history", { description: "3 paid invoices available." })}>
              Invoices
            </Button>
            <Button size="sm" onClick={() => toast.success("Plan management", { description: "Contact sales to upgrade to Scale." })}>
              Manage plan
            </Button>
          </div>
        </div>
      </SettingsPanel>
    </div>
  );
}

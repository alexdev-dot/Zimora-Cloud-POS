"use client";

import * as React from "react";
import { MapPin, Plus, Star, Store } from "lucide-react";
import { toast } from "sonner";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
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
import type { Branch } from "@/types";

export default function LocationsSettingsPage() {
  const [rows, setRows] = React.useState<Branch[]>([]);
  const [addOpen, setAddOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [area, setArea] = React.useState("");
  const [city, setCity] = React.useState("Nairobi");
  const [address, setAddress] = React.useState("");

  function add() {
    if (!name.trim() || !area.trim()) {
      toast.error("Branch name and area are required");
      return;
    }
    const b: Branch = {
      id: uid("b"),
      name: name.trim(),
      area: area.trim(),
      city,
      address: address.trim() || `${area.trim()}, ${city}`,
      isMain: false,
      status: "open",
    };
    setRows((prev) => [...prev, b]);
    setAddOpen(false);
    setName("");
    setArea("");
    setAddress("");
    toast.success("Location added", { description: b.name });
  }

  return (
    <div className="space-y-4">
      <SettingsPanel
        title="Locations"
        description="Branches and storage locations where you sell or hold stock"
        footer={
          <Button onClick={() => setAddOpen(true)}>
            <Plus /> Add location
          </Button>
        }
      >
        <ul className="space-y-2.5">
          {rows.map((b) => (
            <li
              key={b.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-4 py-3.5"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Store className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[13.5px] font-semibold">
                  {b.name}
                  {b.isMain && (
                    <Badge variant="primary">
                      <Star className="size-2.5" /> Main
                    </Badge>
                  )}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" /> {b.address}
                </p>
              </div>
              <Badge variant={b.status === "open" ? "success" : "default"} dot>
                {b.status === "open" ? "Open" : "Closed"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info("Edit location", { description: `${b.name}` })}
              >
                Edit
              </Button>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          The Growth plan includes 3 locations. Extra locations cost KSh 1,500/month each.
        </p>
      </SettingsPanel>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Add location</DialogTitle>
            <DialogDescription>Open a new branch or storage location</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3.5">
            <FormField label="Location name" htmlFor="loc-name" required>
              <Input id="loc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Junction Mall" />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Area" htmlFor="loc-area" required>
                <Input id="loc-area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Ngong Road" />
              </FormField>
              <FormField label="City" htmlFor="loc-city">
                <NativeSelect id="loc-city" value={city} onChange={(e) => setCity(e.target.value)}>
                  <option>Nairobi</option>
                  <option>Mombasa</option>
                  <option>Kisumu</option>
                  <option>Nakuru</option>
                  <option>Eldoret</option>
                </NativeSelect>
              </FormField>
            </div>
            <FormField label="Address" htmlFor="loc-address" hint="Optional — defaults to area, city">
              <Input id="loc-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, building" />
            </FormField>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={add}>Add location</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

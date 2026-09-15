"use client";

import * as React from "react";
import { ScanLine } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { formatKES } from "@/lib/utils";
import type { Product } from "@/types";

export function BarcodeDialog({
  open,
  onOpenChange,
  onFound,
  products,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFound: (p: Product) => void;
  products: Product[];
}) {
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setValue("");
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  function resolve(raw: string): Product | null {
    const v = raw.trim().toLowerCase();
    if (!v) return null;
    return (
      products.find((p) => p.barcode === v || p.sku.toLowerCase() === v) ??
      products.find((p) => p.barcode.includes(v) || p.sku.toLowerCase().includes(v)) ??
      null
    );
  }

  function submit() {
    const p = resolve(value);
    if (p) {
      onFound(p);
      onOpenChange(false);
    } else {
      setError("No product matches this barcode or SKU.");
    }
  }

  function simulateScan() {
    const inStock = products.filter((p) => p.stock > 0);
    if (inStock.length === 0) {
      setError("No products in stock to simulate scan.");
      return;
    }
    const p = inStock[Math.floor(Math.random() * inStock.length)];
    setValue(p.barcode);
    onFound(p);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="size-4 text-primary" /> Scan barcode
          </DialogTitle>
          <DialogDescription>
            Use a USB/Bluetooth scanner or type a barcode or SKU manually.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
              // Most hardware scanners send an Enter keystroke — resolve immediately
              if (e.key === "Enter" && value.length >= 8) {
                const p = resolve(value);
                if (p) {
                  onFound(p);
                  onOpenChange(false);
                }
              }
            }}
            placeholder="e.g. 5449000000996 or BEV-001"
            aria-label="Barcode or SKU"
            aria-invalid={Boolean(error)}
            autoFocus
          />
          {error && (
            <p role="alert" className="mt-2 text-xs font-medium text-destructive">
              {error}
            </p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            {products.length > 0
              ? `Try any product barcode — for example ${products[0].name} (${products[0].barcode}, ${formatKES(products[0].price)}).`
              : "No products available. Add products in the Products page."}
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={simulateScan}>
            <ScanLine /> Simulate scan
          </Button>
          <Button onClick={submit} disabled={!value.trim()}>
            Add to cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

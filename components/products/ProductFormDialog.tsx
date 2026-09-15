"use client";

import * as React from "react";
import { ImagePlus, Package } from "lucide-react";
import { toast } from "sonner";
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
import { FormField, Input, NativeSelect, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CATEGORIES, UNITS, branches, suppliers } from "@/lib/constants";
import { getProducts } from "@/lib/api/products";
import { uid } from "@/lib/utils";
import type { Product } from "@/types";

interface FormState {
  name: string;
  sku: string;
  barcode: string;
  category: Product["category"];
  description: string;
  price: string;
  cost: string;
  taxRate: string;
  stock: string;
  minStock: string;
  maxStock: string;
  unit: Product["unit"];
  location: string;
  supplier: string;
  brand: string;
  trackInventory: boolean;
}

function toForm(p?: Product | null): FormState {
  return {
    name: p?.name ?? "",
    sku: p?.sku ?? "",
    barcode: p?.barcode ?? "",
    category: p?.category ?? "Beverages",
    description: p?.description ?? "",
    price: p ? String(p.price) : "",
    cost: p ? String(p.cost) : "",
    taxRate: p ? String(p.taxRate) : "16",
    stock: p ? String(p.stock) : "",
    minStock: p ? String(p.minStock) : "",
    maxStock: p ? String(p.maxStock) : "",
    unit: p?.unit ?? "pc",
    location: p?.location ?? (branches[0]?.name || "Main Location"),
    supplier: p?.supplier ?? (suppliers[0]?.name || "Default Supplier"),
    brand: p?.brand ?? "",
    trackInventory: p ? p.sku !== "OT-002" : true,
  };
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSave: (p: Product) => void;
}) {
  const [form, setForm] = React.useState<FormState>(() => toForm(product));
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = React.useState(false);
  const [allProducts, setAllProducts] = React.useState<Product[]>([]);

  // Load all products for uniqueness validation
  React.useEffect(() => {
    if (open) {
      getProducts().then(setAllProducts).catch(console.error);
    }
  }, [open]);

  React.useEffect(() => {
    if (open) {
      setForm(toForm(product));
      setErrors({});
    }
  }, [open, product]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function validate(): Promise<boolean> {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Product name is required";
    if (!form.sku.trim()) e.sku = "SKU is required";
    else if (!/^[A-Za-z0-9-]{2,20}$/.test(form.sku.trim())) e.sku = "Use 2–20 letters, numbers or dashes";
    else {
      // Check SKU uniqueness
      const skuExists = allProducts.some(
        p => p.sku === form.sku.trim() && p.id !== product?.id
      );
      if (skuExists) e.sku = "SKU already exists";
    }
    if (!form.price || parseFloat(form.price) <= 0) e.price = "Enter a valid selling price";
    if (!form.cost || parseFloat(form.cost) < 0) e.cost = "Enter a valid cost price";
    if (form.stock === "" || parseInt(form.stock) < 0) e.stock = "Enter current stock";
    if (form.minStock === "" || parseInt(form.minStock) < 0) e.minStock = "Set a minimum stock level";
    if (form.trackInventory && form.maxStock && parseInt(form.maxStock) < parseInt(form.minStock || "0"))
      e.maxStock = "Max stock must be ≥ minimum stock";
    
    // Check barcode uniqueness if provided
    if (form.barcode.trim()) {
      const barcodeExists = allProducts.some(
        p => p.barcode === form.barcode.trim() && p.id !== product?.id
      );
      if (barcodeExists) e.barcode = "Barcode already exists";
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function save() {
    setIsValidating(true);
    const isValid = await validate();
    setIsValidating(false);
    
    if (!isValid) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    const now = new Date().toISOString();
    const base: Product = product ?? {
      id: uid("p"),
      name: "",
      sku: "",
      barcode: "",
      category: "Other",
      price: 0,
      cost: 0,
      taxRate: 16,
      stock: 0,
      minStock: 0,
      maxStock: 100,
      unit: "pc",
      location: branches[0]?.name || "Main Location",
      supplier: suppliers[0]?.name || "Default Supplier",
      status: "active",
      updatedAt: now,
      createdAt: now,
      sold: 0,
    };
    const saved: Product = {
      ...base,
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      barcode: form.barcode.trim() || String(600000000000 + Math.floor(Math.random() * 99999999999)),
      category: form.category,
      description: form.description,
      price: parseFloat(form.price),
      cost: parseFloat(form.cost),
      taxRate: parseFloat(form.taxRate),
      stock: parseInt(form.stock) || 0,
      minStock: parseInt(form.minStock) || 0,
      maxStock: parseInt(form.maxStock) || Math.max(100, (parseInt(form.minStock) || 0) * 4),
      unit: form.unit,
      location: form.location,
      supplier: form.supplier,
      brand: form.brand,
      status: product?.status ?? "active",
      updatedAt: now,
    };
    onSave(saved);
    onOpenChange(false);
    toast.success(product ? "Product updated" : "Product created", {
      description: `${saved.name} · ${saved.sku}`,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="size-4 text-primary" />
            {product ? "Edit Product" : "Add Product"}
          </DialogTitle>
          <DialogDescription>
            {product ? `Update details for ${product.name}` : "Create a new product in your catalog"}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Basic information */}
            <section className="space-y-3.5 sm:col-span-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Basic information
              </h4>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <FormField label="Product name" htmlFor="pf-name" required error={errors.name}>
                  <Input
                    id="pf-name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Coca-Cola 500ml"
                    aria-invalid={Boolean(errors.name)}
                  />
                </FormField>
                <FormField label="SKU" htmlFor="pf-sku" required error={errors.sku}>
                  <Input
                    id="pf-sku"
                    value={form.sku}
                    onChange={(e) => set("sku", e.target.value.toUpperCase())}
                    placeholder="e.g. BEV-001"
                    aria-invalid={Boolean(errors.sku)}
                    className="font-mono"
                  />
                </FormField>
                <FormField label="Barcode" htmlFor="pf-barcode" hint="EAN-13 or CODE128 — leave blank to auto-generate" error={errors.barcode}>
                  <Input
                    id="pf-barcode"
                    value={form.barcode}
                    onChange={(e) => set("barcode", e.target.value)}
                    placeholder="e.g. 5449000000996"
                    className="font-mono"
                    aria-invalid={Boolean(errors.barcode)}
                  />
                </FormField>
                <FormField label="Category" htmlFor="pf-category">
                  <NativeSelect
                    id="pf-category"
                    value={form.category}
                    onChange={(e) => set("category", e.target.value as Product["category"])}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </NativeSelect>
                </FormField>
                <FormField label="Description" htmlFor="pf-desc" className="sm:col-span-2">
                  <Textarea
                    id="pf-desc"
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Short description shown on product pages and receipts"
                    rows={2}
                  />
                </FormField>
                <div className="sm:col-span-2">
                  <span className="mb-1.5 block text-[13px] font-medium">Product image</span>
                  <button
                    type="button"
                    onClick={() => toast.info("Image upload", { description: "Connect storage (e.g. Supabase) to enable uploads." })}
                    className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-muted/30 px-4 py-6 text-[13px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    <ImagePlus className="size-4" /> Upload an image or drag &amp; drop
                  </button>
                </div>
              </div>
            </section>

            {/* Pricing */}
            <section className="space-y-3.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pricing</h4>
              <FormField label="Selling price (KSh)" htmlFor="pf-price" required error={errors.price}>
                <Input
                  id="pf-price"
                  inputMode="decimal"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder="0"
                  aria-invalid={Boolean(errors.price)}
                  className="tabular-nums"
                />
              </FormField>
              <FormField label="Cost price (KSh)" htmlFor="pf-cost" required error={errors.cost}>
                <Input
                  id="pf-cost"
                  inputMode="decimal"
                  value={form.cost}
                  onChange={(e) => set("cost", e.target.value)}
                  placeholder="0"
                  aria-invalid={Boolean(errors.cost)}
                  className="tabular-nums"
                />
              </FormField>
              <FormField label="Tax rate" htmlFor="pf-tax">
                <NativeSelect id="pf-tax" value={form.taxRate} onChange={(e) => set("taxRate", e.target.value)}>
                  <option value="16">VAT Standard — 16%</option>
                  <option value="8">VAT Hospitality — 8%</option>
                  <option value="0">Zero-rated — 0%</option>
                </NativeSelect>
              </FormField>
            </section>

            {/* Inventory */}
            <section className="space-y-3.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Inventory</h4>
              <div className="grid grid-cols-3 gap-2.5">
                <FormField label="Stock" htmlFor="pf-stock" required error={errors.stock}>
                  <Input
                    id="pf-stock"
                    inputMode="numeric"
                    value={form.stock}
                    onChange={(e) => set("stock", e.target.value)}
                    placeholder="0"
                    aria-invalid={Boolean(errors.stock)}
                    className="tabular-nums"
                  />
                </FormField>
                <FormField label="Min" htmlFor="pf-min" required error={errors.minStock}>
                  <Input
                    id="pf-min"
                    inputMode="numeric"
                    value={form.minStock}
                    onChange={(e) => set("minStock", e.target.value)}
                    placeholder="0"
                    aria-invalid={Boolean(errors.minStock)}
                    className="tabular-nums"
                  />
                </FormField>
                <FormField label="Max" htmlFor="pf-max" error={errors.maxStock}>
                  <Input
                    id="pf-max"
                    inputMode="numeric"
                    value={form.maxStock}
                    onChange={(e) => set("maxStock", e.target.value)}
                    placeholder="Auto"
                    aria-invalid={Boolean(errors.maxStock)}
                    className="tabular-nums"
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <FormField label="Unit" htmlFor="pf-unit">
                  <NativeSelect id="pf-unit" value={form.unit} onChange={(e) => set("unit", e.target.value as Product["unit"])}>
                    {UNITS.map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </NativeSelect>
                </FormField>
                <FormField label="Location" htmlFor="pf-loc">
                  <NativeSelect id="pf-loc" value={form.location} onChange={(e) => set("location", e.target.value)}>
                    {branches.map((b) => (
                      <option key={b.id}>{b.name}</option>
                    ))}
                  </NativeSelect>
                </FormField>
              </div>
            </section>

            {/* Advanced */}
            <section className="space-y-3.5 sm:col-span-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Advanced</h4>
              <div className="grid gap-3.5 sm:grid-cols-3">
                <FormField label="Supplier" htmlFor="pf-supplier">
                  <NativeSelect id="pf-supplier" value={form.supplier} onChange={(e) => set("supplier", e.target.value)}>
                    {suppliers.map((s) => (
                      <option key={s.id}>{s.name}</option>
                    ))}
                  </NativeSelect>
                </FormField>
                <FormField label="Brand" htmlFor="pf-brand">
                  <Input id="pf-brand" value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="e.g. Coca-Cola" />
                </FormField>
                <FormField label="Product type" htmlFor="pf-type">
                  <NativeSelect id="pf-type" defaultValue="simple">
                    <option value="simple">Simple product</option>
                    <option value="variable">Variable (variants)</option>
                    <option value="service">Service</option>
                  </NativeSelect>
                </FormField>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border px-3.5 py-3">
                <div>
                  <p className="text-[13px] font-medium">Track inventory</p>
                  <p className="text-xs text-muted-foreground">
                    Deduct stock on every sale and receive low-stock alerts
                  </p>
                </div>
                <Switch
                  aria-label="Track inventory"
                  checked={form.trackInventory}
                  onCheckedChange={(v) => set("trackInventory", v)}
                />
              </div>
            </section>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={isValidating}>
            {isValidating ? "Validating..." : product ? "Save changes" : "Save Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

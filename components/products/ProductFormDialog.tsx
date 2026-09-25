"use client";

import * as React from "react";
import { ImagePlus, Package, DollarSign, Box, Settings, X, Upload } from "lucide-react";
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
import { UNITS, branches, suppliers } from "@/lib/constants";
import { uid } from "@/lib/utils";
import { getUserFriendlyErrorMessage, withPartialSuccessHandling } from "@/lib/utils/errorHandler";
import { validateProduct } from "@/lib/utils/validation";
import type { Product } from "@/types";
import type { CategoryEntity } from "@/types";

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
  trackInventory: boolean;
}

function toForm(p?: Product | null): FormState {
  return {
    name: p?.name ?? "",
    sku: p?.sku ?? "",
    barcode: p?.barcode ?? "",
    category: p?.category ?? "General", // Default category
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
  const [categories, setCategories] = React.useState<CategoryEntity[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = React.useState(false);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(product?.imageUrl || null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  // Load all products for uniqueness validation
  React.useEffect(() => {
    if (open) {
      setAllProducts([]);
      
      // Load dynamic categories
      setIsLoadingCategories(true);
      setCategories([]);
      setIsLoadingCategories(false);
    }
  }, [open]);

  React.useEffect(() => {
    if (open) {
      setForm(toForm(product));
      setErrors({});
      setImagePreview(product?.imageUrl || null);
      setImageFile(null);
      // Storage functionality removed - no path extraction needed
    }
  }, [open, product]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type', { description: 'Only JPEG, PNG, WebP, GIF, and AVIF are allowed.' });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', { description: 'Maximum file size is 5MB.' });
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type', { description: 'Only JPEG, PNG, WebP, GIF, and AVIF are allowed.' });
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File too large', { description: 'Maximum file size is 5MB.' });
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  const imageInputRef = React.useRef<HTMLInputElement>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function validate(): Promise<boolean> {
    // Use the centralized validation utility
    const productData = {
      id: product?.id || '',
      name: form.name,
      sku: form.sku,
      barcode: form.barcode,
      category: form.category.trim() || "General",
      price: form.price,
      cost: form.cost,
      stock: form.stock,
      minStock: form.minStock,
      maxStock: form.maxStock,
    };

    const validationResult = validateProduct(productData, undefined, allProducts);
    
    setErrors(validationResult.errors);
    return validationResult.valid;
  }

  async function save() {
    setIsValidating(true);
    const isValid = await validate();
    setIsValidating(false);

    if (!isValid) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    setIsUploading(true);
    let uploadedImageUrl: string | null = null;

    const result = await withPartialSuccessHandling(
      async () => {
        // Image upload disabled - use placeholder if image file provided
        if (imageFile) {
          uploadedImageUrl = `https://via.placeholder.com/400x400?text=${encodeURIComponent(form.name || 'Product')}`;
        }

        const now = new Date().toISOString();
        const base: Product = product ?? {
          id: uid("p"),
          name: "",
          sku: "",
          barcode: "",
          category: "",
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
          category: form.category.trim() || "General",
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
          status: product?.status ?? "active",
          updatedAt: now,
          imageUrl: uploadedImageUrl || product?.imageUrl || undefined,
        };

        onSave(saved);
        onOpenChange(false);
        return saved;
      },
      "product save",
      async () => {
        // No cleanup needed for placeholder images
      }
    );

    setIsUploading(false);

    if (result.success) {
      toast.success(product ? "Product updated" : "Product created", {
        description: `${result.data.name} · ${result.data.sku}`,
      });
    } else if (result.partialSuccess) {
      toast.warning("Product saved with issues", {
        description: getUserFriendlyErrorMessage(result.error || "Some operations failed")
      });
    } else {
      toast.error('Failed to save product', { 
        description: getUserFriendlyErrorMessage(result.error || 'Please try again.') 
      });
    }
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
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Product Details */}
            <section className="space-y-4 sm:col-span-2">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Package className="size-4 text-primary" />
                <h4 className="text-sm font-semibold">Product Details</h4>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Image Upload */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2">Product Image</label>
                  <div className="flex items-start gap-4">
                    <div 
                      className={`relative group cursor-pointer transition-all ${
                        isDragging ? 'ring-2 ring-primary ring-offset-2' : ''
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => imageInputRef.current?.click()}
                    >
                      {imagePreview ? (
                        <div className="relative size-24 rounded-lg overflow-hidden border border-border bg-muted">
                          <img
                            src={imagePreview}
                            alt="Product preview"
                            className="size-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage();
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="size-3" />
                          </button>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-white text-xs">Click to change</p>
                          </div>
                        </div>
                      ) : (
                        <div className={`size-24 rounded-lg border-2 border-dashed bg-muted flex items-center justify-center transition-all ${
                          isDragging ? 'border-primary bg-primary/10' : 'border-border'
                        }`}>
                          <ImagePlus className={`size-8 text-muted-foreground ${isDragging ? 'text-primary' : ''}`} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif"
                        onChange={handleImageChange}
                        className="hidden"
                        id="pf-image"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => imageInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          <Upload className="size-4 mr-2" />
                          {isUploading ? "Uploading..." : imagePreview ? "Change Image" : "Upload Image"}
                        </Button>
                        {imagePreview && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveImage}
                            disabled={isUploading}
                          >
                            <X className="size-4 mr-2" />
                            Remove
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        JPEG, PNG, WebP, GIF, or AVIF. Max 5MB. Drag & drop supported.
                      </p>
                    </div>
                  </div>
                </div>

                <FormField label="Product name" htmlFor="pf-name" required error={errors.name}>
                  <Input
                    id="pf-name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Coca-Cola 500ml"
                    aria-invalid={Boolean(errors.name)}
                    className="font-medium"
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
                <FormField label="Barcode" htmlFor="pf-barcode" hint="Leave blank to auto-generate" error={errors.barcode}>
                  <Input
                    id="pf-barcode"
                    value={form.barcode}
                    onChange={(e) => set("barcode", e.target.value)}
                    placeholder="e.g. 5449000000996"
                    className="font-mono"
                    aria-invalid={Boolean(errors.barcode)}
                  />
                </FormField>
                <FormField label="Category" htmlFor="pf-category" error={errors.category}>
                  <NativeSelect
                    id="pf-category"
                    value={form.category}
                    onChange={(e) => set("category", e.target.value as Product["category"])}
                    disabled={isLoadingCategories}
                    aria-invalid={Boolean(errors.category)}
                  >
                    {isLoadingCategories ? (
                      <option>Loading categories...</option>
                    ) : categories.length > 0 ? (
                      <>
                        <option value="General">General (Default)</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </>
                    ) : (
                      <option value="General">General (Default)</option>
                    )}
                  </NativeSelect>
                </FormField>
                <FormField label="Description" htmlFor="pf-desc" className="sm:col-span-2">
                  <Textarea
                    id="pf-desc"
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Short description shown on product pages and receipts"
                    rows={3}
                  />
                </FormField>
              </div>
            </section>

            {/* Pricing */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <DollarSign className="size-4 text-primary" />
                <span className="text-sm font-semibold">Pricing</span>
              </div>
              <div className="space-y-4">
                <FormField label="Selling price (KSh)" htmlFor="pf-price" required error={errors.price}>
                  <Input
                    id="pf-price"
                    inputMode="decimal"
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    placeholder="0.00"
                    aria-invalid={Boolean(errors.price)}
                    className="tabular-nums text-lg font-semibold"
                  />
                </FormField>
                <FormField label="Cost price (KSh)" htmlFor="pf-cost" required error={errors.cost}>
                  <Input
                    id="pf-cost"
                    inputMode="decimal"
                    value={form.cost}
                    onChange={(e) => set("cost", e.target.value)}
                    placeholder="0.00"
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
              </div>
            </section>

            {/* Inventory */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Box className="size-4 text-primary" />
                <span className="text-sm font-semibold">Inventory</span>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <FormField label="Stock" htmlFor="pf-stock" required error={errors.stock}>
                    <Input
                      id="pf-stock"
                      inputMode="numeric"
                      value={form.stock}
                      onChange={(e) => set("stock", e.target.value)}
                      placeholder="0"
                      aria-invalid={Boolean(errors.stock)}
                      className="tabular-nums text-center"
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
                      className="tabular-nums text-center"
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
                      className="tabular-nums text-center"
                    />
                  </FormField>
                </div>
                <div className="grid grid-cols-2 gap-3">
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
              </div>
            </section>

            {/* Settings */}
            <section className="space-y-4 sm:col-span-2">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Settings className="size-4 text-primary" />
                <span className="text-sm font-semibold">Settings</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Supplier" htmlFor="pf-supplier">
                  <NativeSelect id="pf-supplier" value={form.supplier} onChange={(e) => set("supplier", e.target.value)}>
                    {suppliers.map((s) => (
                      <option key={s.id}>{s.name}</option>
                    ))}
                  </NativeSelect>
                </FormField>
                <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3 bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">Track inventory</p>
                    <p className="text-xs text-muted-foreground">
                      Auto-deduct stock on sales
                    </p>
                  </div>
                  <Switch
                    aria-label="Track inventory"
                    checked={form.trackInventory}
                    onCheckedChange={(v) => set("trackInventory", v)}
                  />
                </div>
              </div>
            </section>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={save} disabled={isValidating || isUploading}>
            {isUploading ? "Uploading..." : isValidating ? "Validating..." : product ? "Save changes" : "Save Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

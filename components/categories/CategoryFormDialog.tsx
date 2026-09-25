"use client";

import * as React from "react";
import { Package } from "lucide-react";
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
import type { CategoryEntity } from "@/types";

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface FormState {
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

function toForm(category?: CategoryEntity | null): FormState {
  return {
    name: category?.name ?? "",
    description: category?.description ?? "",
    status: category?.status ?? "active",
  };
}



export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: CategoryEntity | null;
  onSave: (c: CategoryEntity) => void;
}) {
  const [form, setForm] = React.useState<FormState>(() => toForm(category));
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open) {
      setForm(toForm(category));
      setErrors({});
    }
  }, [open, category]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function validate(): Promise<boolean> {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Category name is required";
    if (form.name.length > 50) e.name = "Category name must be less than 50 characters";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function save() {
    const isValid = await validate();
    if (!isValid) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    const now = new Date().toISOString();
    const base: CategoryEntity = category ?? {
      id: generateUUID(),
      name: "",
      description: "",
      status: "active",
      created_at: now,
      updated_at: now,
    };

    const saved: CategoryEntity = {
      ...base,
      name: form.name.trim(),
      description: form.description.trim(),
      status: form.status,
      updated_at: now,
    };

    onSave(saved);
    onOpenChange(false);
    toast.success(category ? "Category updated" : "Category created", {
      description: `${saved.name}`,
    });
  }



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="size-4 text-primary" />
            {category ? "Edit Category" : "Add Category"}
          </DialogTitle>
          <DialogDescription>
            {category ? `Update details for ${category.name}` : "Create a new category to organize your products"}
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
                <FormField label="Category name" htmlFor="cf-name" required error={errors.name} className="sm:col-span-2">
                  <Input
                    id="cf-name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Beverages"
                    aria-invalid={Boolean(errors.name)}
                  />
                </FormField>
                <FormField label="Status" htmlFor="cf-status">
                  <NativeSelect
                    id="cf-status"
                    value={form.status}
                    onChange={(e) => set("status", e.target.value as 'active' | 'inactive')}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </NativeSelect>
                </FormField>
                <FormField label="Description" htmlFor="cf-desc" className="sm:col-span-2">
                  <Textarea
                    id="cf-desc"
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Short description of this category"
                    rows={2}
                  />
                </FormField>
              </div>
            </section>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>
            {category ? "Update Category" : "Create Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

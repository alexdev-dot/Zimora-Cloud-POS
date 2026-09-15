"use client";

import * as React from "react";
import { useRef } from "react";
import {
  AlertCircle,
  Building,
  Factory,
  MoreHorizontal,
  Phone,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";

import { formatKES, uid } from "@/lib/utils";
import { useSimulatedLoading } from "@/lib/hooks";
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier, subscribeToSuppliers, unsubscribeFromSuppliers } from "@/lib/api/suppliers";
import type { Supplier } from "@/types";

export default function SuppliersPage() {
  const loading = useSimulatedLoading(450);
  const [rows, setRows] = React.useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [detail, setDetail] = React.useState<Supplier | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const subscriptionRef = React.useRef<any>(null);

  // Fetch suppliers on mount
  React.useEffect(() => {
    async function fetchSuppliers() {
      try {
        const data = await getSuppliers();
        setRows(data);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSuppliers();

    // Set up real-time subscription (separate from data fetch to avoid duplicate subscriptions)
    if (!subscriptionRef.current) {
      const channel = subscribeToSuppliers((updatedSuppliers) => {
        setRows(updatedSuppliers);
      });
      subscriptionRef.current = channel;
    }

    // Cleanup subscription on unmount
    return () => {
      if (subscriptionRef.current) {
        unsubscribeFromSuppliers(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, []);

  const stats = React.useMemo(
    () => ({
      total: rows.length,
      active: rows.filter((s) => s.status === "active").length,
      outstanding: rows.reduce((a, s) => a + s.outstanding, 0),
      products: rows.reduce((a, s) => a + s.products, 0),
    }),
    [rows]
  );

  const columns: ColumnDef<Supplier>[] = [
    {
      id: "supplier",
      header: "Supplier",
      accessor: (r) => r.name,
      sortable: true,
      cell: (r) => (
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200/70">
            <Factory className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="max-w-[200px] truncate font-medium">{r.name}</p>
            <p className="text-xs text-muted-foreground">{r.supplies}</p>
          </div>
        </div>
      ),
    },
    {
      id: "contact",
      header: "Contact",
      accessor: (r) => r.contactPerson,
      cell: (r) => (
        <div>
          <p>{r.contactPerson}</p>
          <p className="text-xs text-muted-foreground tabular-nums">{r.phone}</p>
        </div>
      ),
    },
    {
      id: "email",
      header: "Email",
      accessor: (r) => r.email,
      hideBelow: "xl",
      cell: (r) => <span className="max-w-[180px] truncate text-muted-foreground">{r.email}</span>,
    },
    {
      id: "products",
      header: "Products",
      accessor: (r) => r.products,
      align: "right",
      sortable: true,
      hideBelow: "md",
      cell: (r) => <span className="tabular-nums">{r.products}</span>,
    },
    {
      id: "outstanding",
      header: "Outstanding",
      accessor: (r) => r.outstanding,
      align: "right",
      sortable: true,
      cell: (r) =>
        r.outstanding > 0 ? (
          <span className="inline-flex items-center gap-1 font-semibold tabular-nums text-amber-700">
            <AlertCircle className="size-3.5" />
            {formatKES(r.outstanding)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: "status",
      header: "Status",
      accessor: (r) => r.status,
      cell: (r) => <StatusBadge status={r.status} />,
    },
  ];

  return (
    <div className="page space-y-5">
      <PageHeader
        title="Suppliers"
        description="Vendor directory, contacts and outstanding balances"
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus /> Add Supplier
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard loading={loading || isLoading} label="Total Suppliers" value={String(stats.total)} icon={Factory} />
        <MetricCard loading={loading || isLoading} label="Active" value={String(stats.active)} icon={Factory} iconTone="info" />
        <MetricCard
          loading={loading || isLoading}
          label="Outstanding Payable"
          value={formatKES(stats.outstanding)}
          icon={AlertCircle}
          iconTone="warning"
        />
        <MetricCard loading={loading || isLoading} label="Products Supplied" value={String(stats.products)} icon={Building} iconTone="default" />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        rowKey={(r) => r.id}
        loading={loading || isLoading}
        searchable="Search suppliers…"
        pageSize={8}
        onRowClick={(r) => setDetail(r)}
        emptyIcon={Factory}
        emptyTitle="No suppliers yet"
        emptyDescription="Add suppliers to manage purchase orders and restocking."
        emptyAction={
          <Button onClick={() => setAddOpen(true)}>
            <Plus /> Add Supplier
          </Button>
        }
        rowActions={(r) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${r.name}`}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setDetail(r)}>
                <Building /> View supplier
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/purchases">
                  <Plus /> New purchase order
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  toast.success("Payment recorded", {
                    description: `KES ${r.outstanding.toLocaleString()} marked as settled for ${r.name}.`,
                  })
                }
                disabled={r.outstanding === 0}
              >
                <Phone /> Record payment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        mobileCard={(r) => (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[13.5px] font-medium">{r.name}</span>
              <StatusBadge status={r.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              {r.contactPerson} · <span className="tabular-nums">{r.phone}</span>
            </p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{r.products} products</span>
              {r.outstanding > 0 ? (
                <span className="font-semibold tabular-nums text-amber-700">
                  {formatKES(r.outstanding)} due
                </span>
              ) : (
                <span className="text-muted-foreground">No balance</span>
              )}
            </div>
          </div>
        )}
      />

      <Sheet open={Boolean(detail)} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent>
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle>{detail.name}</SheetTitle>
                <SheetDescription>{detail.supplies}</SheetDescription>
                <div className="mt-2">
                  <StatusBadge status={detail.status} dot />
                </div>
              </SheetHeader>
              <SheetBody className="space-y-4">
                <dl className="space-y-2.5 text-[13px]">
                  <Line label="Contact person" value={detail.contactPerson} />
                  <Line label="Phone" value={detail.phone} mono />
                  <Line label="Email" value={detail.email} mono />
                  <Line label="Products supplied" value={String(detail.products)} />
                  <Line
                    label="Outstanding balance"
                    value={detail.outstanding > 0 ? formatKES(detail.outstanding) : "Nothing due"}
                  />
                </dl>
                <div className="rounded-lg border border-border bg-muted/30 p-3.5 text-[13px] text-muted-foreground">
                  Payment terms are negotiated per purchase order. Record deliveries against POs to keep
                  balances up to date.
                </div>
              </SheetBody>
              <SheetFooter className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => toast.info("Calling " + detail.contactPerson + "…")}>
                  <Phone /> Call
                </Button>
                <Button asChild>
                  <a href="/purchases">New order</a>
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AddSupplierDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={async (s) => {
          try {
            await createSupplier(s);
            // Refresh list
            const updated = await getSuppliers();
            setRows(updated);
            setAddOpen(false);
            toast.success("Supplier added", { description: s.name });
          } catch (error) {
            console.error('Failed to add supplier:', error);
            toast.error('Failed to add supplier');
          }
        }}
      />
    </div>
  );
}

function Line({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={"text-right font-medium " + (mono ? "font-mono text-xs" : "")}>{value}</dd>
    </div>
  );
}

function AddSupplierDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onAdd: (s: Supplier) => void;
}) {
  const [name, setName] = React.useState("");
  const [contactPerson, setContactPerson] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [supplies, setSupplies] = React.useState("General supplies");
  const [errors, setErrors] = React.useState<{ name?: string; contactPerson?: string }>({});

  React.useEffect(() => {
    if (open) {
      setName("");
      setContactPerson("");
      setPhone("");
      setEmail("");
      setErrors({});
    }
  }, [open]);

  function save() {
    const e: { name?: string; contactPerson?: string } = {};
    if (!name.trim()) e.name = "Business name is required";
    if (!contactPerson.trim()) e.contactPerson = "Contact person is required";
    setErrors(e);
    if (Object.keys(e).length) return;
    onAdd({
      id: uid("s"),
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim() || "—",
      email: email.trim() || "—",
      supplies,
      products: 0,
      outstanding: 0,
      status: "active",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Add supplier</DialogTitle>
          <DialogDescription>Register a vendor for purchase orders</DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-3.5">
          <FormField label="Business name" htmlFor="su-name" required error={errors.name}>
            <Input id="su-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bidco Africa" aria-invalid={Boolean(errors.name)} />
          </FormField>
          <FormField label="Contact person" htmlFor="su-contact" required error={errors.contactPerson}>
            <Input id="su-contact" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="e.g. Rose Nyambura" aria-invalid={Boolean(errors.contactPerson)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Phone" htmlFor="su-phone">
              <Input id="su-phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XX XXX XXX" />
            </FormField>
            <FormField label="Email" htmlFor="su-email">
              <Input id="su-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="orders@vendor.com" />
            </FormField>
          </div>
          <FormField label="Supplies" htmlFor="su-supplies">
            <NativeSelect id="su-supplies" value={supplies} onChange={(e) => setSupplies(e.target.value)}>
              <option>General supplies</option>
              <option>Beverages</option>
              <option>Dairy</option>
              <option>Grains & Flour</option>
              <option>Edible Oils & Home Care</option>
              <option>Electronics</option>
              <option>FMCG & Personal Care</option>
            </NativeSelect>
          </FormField>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>Save supplier</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

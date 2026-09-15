"use client";

import * as React from "react";
import {
  Crown,
  MoreHorizontal,
  Pencil,
  Plus,
  Star,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
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
import { Avatar } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { formatKES, formatDate, timeAgo, uid } from "@/lib/utils";
import { useSimulatedLoading } from "@/lib/hooks";
import type { Customer } from "@/types";

const TYPE_VARIANT: Record<Customer["type"], "primary" | "purple" | "info"> = {
  Regular: "primary",
  Wholesale: "purple",
  Corporate: "info",
};

export default function CustomersPage() {
  const loading = useSimulatedLoading(450);
  const [rows, setRows] = React.useState<Customer[]>([]);
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [detail, setDetail] = React.useState<Customer | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);

  const filtered = React.useMemo(
    () => rows.filter((c) => typeFilter === "all" || c.type === typeFilter),
    [rows, typeFilter]
  );

  const stats = React.useMemo(
    () => ({
      total: rows.length,
      members: rows.filter((c) => c.type !== "Regular").length,
      topSpender: [...rows].sort((a, b) => b.totalSpent - a.totalSpent)[0],
      lifetime: rows.reduce((a, c) => a + c.totalSpent, 0),
    }),
    [rows]
  );

  const columns: ColumnDef<Customer>[] = [
    {
      id: "customer",
      header: "Customer",
      accessor: (r) => r.name,
      sortable: true,
      cell: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.name} size={8} />
          <div className="min-w-0">
            <p className="max-w-[160px] truncate font-medium">{r.name}</p>
            <Badge variant={TYPE_VARIANT[r.type]}>{r.type}</Badge>
          </div>
        </div>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      accessor: (r) => r.phone,
      cell: (r) => <span className="tabular-nums text-muted-foreground">{r.phone}</span>,
    },
    {
      id: "email",
      header: "Email",
      accessor: (r) => r.email,
      hideBelow: "xl",
      cell: (r) => <span className="max-w-[170px] truncate text-muted-foreground">{r.email}</span>,
    },
    {
      id: "orders",
      header: "Orders",
      accessor: (r) => r.orders,
      align: "right",
      sortable: true,
      cell: (r) => <span className="tabular-nums">{r.orders}</span>,
    },
    {
      id: "spent",
      header: "Total spent",
      accessor: (r) => r.totalSpent,
      align: "right",
      sortable: true,
      cell: (r) => <span className="font-semibold tabular-nums">{formatKES(r.totalSpent)}</span>,
    },
    {
      id: "points",
      header: "Points",
      accessor: (r) => r.loyaltyPoints,
      align: "right",
      hideBelow: "lg",
      cell: (r) => (
        <span className="inline-flex items-center gap-1 tabular-nums text-muted-foreground">
          <Star className="size-3 text-amber-500" />
          {r.loyaltyPoints.toLocaleString()}
        </span>
      ),
    },
    {
      id: "last",
      header: "Last visit",
      accessor: (r) => r.lastVisit,
      sortable: true,
      hideBelow: "xl",
      cell: (r) => <span className="text-muted-foreground">{timeAgo(r.lastVisit)}</span>,
    },
  ];

  return (
    <div className="page space-y-5">
      <PageHeader
        title="Customers"
        description="Loyalty, purchase history and contact details"
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus /> Add Customer
          </Button>
        }
      />

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <MetricCard loading={loading} label="Total Customers" value={String(stats.total)} icon={Users} />
        <MetricCard loading={loading} label="Wholesale & Corporate" value={String(stats.members)} icon={Crown} iconTone="info" />
        <MetricCard
          loading={loading}
          label="Top Spender"
          value={stats.topSpender ? stats.topSpender.name.split(" ")[0] : "—"}
          icon={Wallet}
          iconTone="primary"
          footer={
            stats.topSpender && (
              <p className="text-xs text-muted-foreground tabular-nums">
                {formatKES(stats.topSpender.totalSpent)} lifetime
              </p>
            )
          }
        />
        <MetricCard loading={loading} label="Lifetime Revenue" value={formatKES(stats.lifetime)} icon={Wallet} iconTone="default" />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(r) => r.id}
        loading={loading}
        searchable="Search customers…"
        pageSize={8}
        defaultSort={{ id: "spent", dir: "desc" }}
        onRowClick={(r) => setDetail(r)}
        emptyIcon={Users}
        emptyTitle="No customers yet"
        emptyDescription="Add your first customer to start tracking loyalty and purchases."
        emptyAction={
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus /> Add Customer
          </Button>
        }
        filters={
          <NativeSelect
            aria-label="Customer type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-[150px]"
          >
            <option value="all">All types</option>
            <option value="Regular">Regular</option>
            <option value="Wholesale">Wholesale</option>
            <option value="Corporate">Corporate</option>
          </NativeSelect>
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
                <Users /> View profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  toast.info("Edit customer", { description: "Inline editing coming soon." })
                }
              >
                <Pencil /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  toast.success("SMS opened", { description: `Message draft to ${r.phone} ready to send.` })
                }
              >
                <Plus /> Send SMS offer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        mobileCard={(r) => (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <Avatar name={r.name} size={9} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium">{r.name}</p>
                <p className="text-[11px] text-muted-foreground tabular-nums">{r.phone}</p>
              </div>
              <Badge variant={TYPE_VARIANT[r.type]}>{r.type}</Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{r.orders} orders</span>
              <span className="font-semibold tabular-nums">{formatKES(r.totalSpent)}</span>
            </div>
          </div>
        )}
      />

      {/* Detail sheet */}
      <Sheet open={Boolean(detail)} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent>
          {detail && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <Avatar name={detail.name} size={12} />
                  <div className="min-w-0">
                    <SheetTitle className="truncate">{detail.name}</SheetTitle>
                    <SheetDescription className="tabular-nums">{detail.phone}</SheetDescription>
                    <div className="mt-1">
                      <Badge variant={TYPE_VARIANT[detail.type]}>{detail.type}</Badge>
                    </div>
                  </div>
                </div>
              </SheetHeader>
              <SheetBody className="space-y-5">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-[15px] font-semibold tabular-nums">{detail.orders}</p>
                    <p className="text-[11px] text-muted-foreground">Orders</p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-[15px] font-semibold tabular-nums">{formatKES(detail.totalSpent)}</p>
                    <p className="text-[11px] text-muted-foreground">Lifetime</p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-[15px] font-semibold tabular-nums">{detail.loyaltyPoints.toLocaleString()}</p>
                    <p className="text-[11px] text-muted-foreground">Points</p>
                  </div>
                </div>

                <dl className="space-y-2.5 text-[13px]">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="max-w-[190px] truncate font-medium">{detail.email}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Last visit</dt>
                    <dd className="font-medium">{timeAgo(detail.lastVisit)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Member since</dt>
                    <dd className="font-medium">{formatDate(new Date().toISOString())}</dd>
                  </div>
                </dl>

                {detail.notes && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-[13px] text-amber-900">
                    <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                      Notes
                    </p>
                    {detail.notes}
                  </div>
                )}

                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Recent purchases
                  </h4>
                  <CustomerPurchases customerId={detail.id} />
                </div>
              </SheetBody>
              <SheetFooter className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    toast.success("SMS opened", { description: `Message draft to ${detail.phone} ready.` })
                  }
                >
                  Send SMS
                </Button>
                <Button asChild>
                  <a href="/pos">Start sale</a>
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AddCustomerDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={(c) => {
          setRows((prev) => [c, ...prev]);
          setAddOpen(false);
          toast.success("Customer added", { description: c.name });
        }}
      />
    </div>
  );
}

function CustomerPurchases({ customerId }: { customerId: string }) {
  // No dummy data - purchases will be loaded from database
  return (
    <p className="rounded-lg border border-dashed border-border p-4 text-center text-[13px] text-muted-foreground">
      No purchases recorded yet
    </p>
  );
}

function AddCustomerDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onAdd: (c: Customer) => void;
}) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [type, setType] = React.useState<Customer["type"]>("Regular");
  const [errors, setErrors] = React.useState<{ name?: string; phone?: string }>({});

  React.useEffect(() => {
    if (open) {
      setName("");
      setPhone("");
      setEmail("");
      setType("Regular");
      setErrors({});
    }
  }, [open]);

  function save() {
    const e: { name?: string; phone?: string } = {};
    if (!name.trim()) e.name = "Customer name is required";
    if (!/^(?:\+?254|0)7\d{8}$/.test(phone.replace(/\s/g, "")))
      e.phone = "Enter a valid Safaricom/Kenyan number (07XX XXX XXX)";
    setErrors(e);
    if (Object.keys(e).length) return;
    onAdd({
      id: uid("c"),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || "—",
      type,
      orders: 0,
      totalSpent: 0,
      loyaltyPoints: 0,
      lastVisit: new Date().toISOString(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Add customer</DialogTitle>
          <DialogDescription>Create a loyalty profile for faster checkout</DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-3.5">
          <FormField label="Full name" htmlFor="cu-name" required error={errors.name}>
            <Input id="cu-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wanjiku Mwangi" aria-invalid={Boolean(errors.name)} />
          </FormField>
          <FormField label="Phone" htmlFor="cu-phone" required error={errors.phone}>
            <Input id="cu-phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XX XXX XXX" aria-invalid={Boolean(errors.phone)} />
          </FormField>
          <FormField label="Email" htmlFor="cu-email" hint="Optional — for receipts and offers">
            <Input id="cu-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com" />
          </FormField>
          <FormField label="Customer type" htmlFor="cu-type">
            <NativeSelect id="cu-type" value={type} onChange={(e) => setType(e.target.value as Customer["type"])}>
              <option>Regular</option>
              <option>Wholesale</option>
              <option>Corporate</option>
            </NativeSelect>
          </FormField>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>Save customer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

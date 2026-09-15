"use client";

import * as React from "react";
import {
  CheckCircle2,
  ClipboardList,
  Download,
  PackageCheck,
  PackageSearch,
  Plus,
  Trash2,
  Truck,
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
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { formatKES, formatDate, isoAhead } from "@/lib/utils";
import { useSimulatedLoading } from "@/lib/hooks";
import { getPurchaseOrders, createPurchaseOrder, updatePurchaseOrder, updatePurchaseOrderStatus, subscribeToPurchaseOrders, unsubscribeFromPurchaseOrders } from "@/lib/api/purchaseOrders";
import type { PurchaseOrder } from "@/types";

export default function PurchasesPage() {
  const loading = useSimulatedLoading(500);
  const [orders, setOrders] = React.useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [detail, setDetail] = React.useState<PurchaseOrder | null>(null);
  const [cancelTarget, setCancelTarget] = React.useState<PurchaseOrder | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const subscriptionRef = React.useRef<any>(null);

  // Fetch purchase orders on mount
  React.useEffect(() => {
    async function fetchPurchaseOrders() {
      try {
        const data = await getPurchaseOrders();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching purchase orders:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPurchaseOrders();

    // Set up real-time subscription (separate from data fetch to avoid duplicate subscriptions)
    if (!subscriptionRef.current) {
      const channel = subscribeToPurchaseOrders((updatedOrders) => {
        setOrders(updatedOrders);
      });
      subscriptionRef.current = channel;
    }

    // Cleanup subscription on unmount
    return () => {
      if (subscriptionRef.current) {
        unsubscribeFromPurchaseOrders(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, []);

  const stats = React.useMemo(() => {
    const onOrder = orders.filter((o) => o.status === "sent" || o.status === "partial");
    return {
      onOrderValue: onOrder.reduce((a, o) => a + o.total, 0),
      awaiting: onOrder.length,
      received: orders.filter((o) => o.status === "received").length,
      drafts: orders.filter((o) => o.status === "draft").length,
    };
  }, [orders]);

  async function receiveOrder(po: PurchaseOrder) {
    try {
      await updatePurchaseOrderStatus(po.id, "received");
      // Refresh list
      const updated = await getPurchaseOrders();
      setOrders(updated);
      setDetail(null);
      toast.success("Stock received", {
        description: `${po.id} · ${po.items.length} products added to inventory at ${po.branch}.`,
      });
    } catch (error) {
      console.error('Failed to receive order:', error);
      toast.error('Failed to receive order');
    }
  }

  const columns: ColumnDef<PurchaseOrder>[] = [
    {
      id: "po",
      header: "Order",
      accessor: (r) => r.id,
      sortable: true,
      cell: (r) => <span className="font-mono text-[13px] font-medium">{r.id}</span>,
    },
    {
      id: "supplier",
      header: "Supplier",
      accessor: (r) => r.supplier,
      sortable: true,
      cell: (r) => <span className="max-w-[180px] truncate">{r.supplier}</span>,
    },
    {
      id: "items",
      header: "Items",
      accessor: (r) => r.items.length,
      align: "right",
      hideBelow: "md",
      cell: (r) => (
        <span className="text-muted-foreground">
          {r.items.length} <span className="text-xs">products</span>
        </span>
      ),
    },
    {
      id: "total",
      header: "Total",
      accessor: (r) => r.total,
      align: "right",
      sortable: true,
      cell: (r) => <span className="font-semibold tabular-nums">{formatKES(r.total)}</span>,
    },
    {
      id: "ordered",
      header: "Ordered",
      accessor: (r) => r.orderDate,
      sortable: true,
      hideBelow: "lg",
      cell: (r) => <span className="text-muted-foreground">{formatDate(r.orderDate)}</span>,
    },
    {
      id: "expected",
      header: "Expected",
      accessor: (r) => r.expectedDate,
      sortable: true,
      hideBelow: "xl",
      cell: (r) => <span className="text-muted-foreground">{formatDate(r.expectedDate)}</span>,
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
        title="Purchases"
        description="Purchase orders and stock incoming from suppliers"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus /> New Purchase Order
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          loading={loading || isLoading}
          label="On Order Value"
          value={formatKES(stats.onOrderValue)}
          icon={Truck}
          footer={<p className="text-xs text-muted-foreground">{stats.awaiting} orders awaiting delivery</p>}
        />
        <MetricCard loading={loading || isLoading} label="Awaiting Delivery" value={String(stats.awaiting)} icon={Truck} iconTone="warning" />
        <MetricCard loading={loading || isLoading} label="Received (all time)" value={String(stats.received)} icon={PackageCheck} iconTone="info" />
        <MetricCard loading={loading || isLoading} label="Draft Orders" value={String(stats.drafts)} icon={ClipboardList} iconTone="default" />
      </div>

      <DataTable
        columns={columns}
        data={orders}
        rowKey={(r) => r.id}
        loading={loading || isLoading}
        searchable="Search order or supplier…"
        pageSize={8}
        defaultSort={{ id: "ordered", dir: "desc" }}
        onRowClick={(r) => setDetail(r)}
        emptyIcon={Truck}
        emptyTitle="No purchase orders yet"
        emptyDescription="Create a purchase order to restock products from your suppliers."
        emptyAction={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus /> New Purchase Order
          </Button>
        }
        rowActions={(r) => (
          <Button variant="ghost" size="sm" onClick={() => setDetail(r)}>
            <PackageSearch /> View
          </Button>
        )}
        mobileCard={(r) => (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[13px] font-medium">{r.id}</span>
              <StatusBadge status={r.status} />
            </div>
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="truncate">{r.supplier}</span>
              <span className="font-semibold text-foreground tabular-nums">{formatKES(r.total)}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {r.items.length} products · expected {formatDate(r.expectedDate)}
            </p>
          </div>
        )}
        footer={
          <span className="flex items-center gap-1.5">
            <Download className="size-3.5" /> Tip: received orders update inventory automatically.
          </span>
        }
      />

      {/* PO detail */}
      <Sheet open={Boolean(detail)} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent>
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle className="font-mono">{detail.id}</SheetTitle>
                <SheetDescription>
                  {detail.supplier} · {detail.branch}
                </SheetDescription>
                <div className="mt-2">
                  <StatusBadge status={detail.status} dot />
                </div>
              </SheetHeader>
              <SheetBody className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-[13px]">
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Ordered</p>
                    <p className="mt-1 font-medium">{formatDate(detail.orderDate, true)}</p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Expected</p>
                    <p className="mt-1 font-medium">{formatDate(detail.expectedDate, true)}</p>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Line items
                  </h4>
                  <ul className="divide-y divide-border/70 rounded-lg border border-border">
                    {detail.items.map((item, i) => (
                      <li key={i} className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-[13px]">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{item.name}</p>
                          <p className="font-mono text-[11px] text-muted-foreground">
                            {item.sku} · {item.qty} × {formatKES(item.unitCost)}
                          </p>
                        </div>
                        <span className="font-semibold tabular-nums">{formatKES(item.qty * item.unitCost)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-between rounded-lg border border-border bg-muted/30 px-3.5 py-3 text-[15px] font-semibold">
                  <span>Order total</span>
                  <span className="tabular-nums">{formatKES(detail.total)}</span>
                </div>
              </SheetBody>
              <SheetFooter className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => toast.info("Email sent", { description: `Chased ${detail.supplier} for delivery update.` })}
                >
                  Chase supplier
                </Button>
                <Button
                  disabled={detail.status === "received" || detail.status === "cancelled"}
                  onClick={() => receiveOrder(detail)}
                >
                  <PackageCheck /> Receive stock
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <NewPODialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={async (po) => {
          try {
            await createPurchaseOrder(po);
            // Refresh list
            const updated = await getPurchaseOrders();
            setOrders(updated);
            setCreateOpen(false);
            toast.success("Purchase order created", { description: `${po.id} saved as draft.` });
          } catch (error) {
            console.error('Failed to create purchase order:', error);
            toast.error('Failed to create purchase order');
          }
        }}
      />

      <ConfirmationDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(o) => !o && setCancelTarget(null)}
        title={`Cancel ${cancelTarget?.id ?? ""}?`}
        description="The purchase order will be cancelled and any expected delivery will be marked as not arriving."
        confirmLabel="Cancel order"
        destructive
        onConfirm={async () => {
          if (cancelTarget) {
            try {
              await updatePurchaseOrderStatus(cancelTarget.id, "cancelled");
              // Refresh list
              const updated = await getPurchaseOrders();
              setOrders(updated);
              setCancelTarget(null);
              toast.success("Purchase order cancelled");
            } catch (error) {
              console.error('Failed to cancel purchase order:', error);
              toast.error('Failed to cancel purchase order');
            }
          }
        }}
      />
    </div>
  );
}

function NewPODialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (po: PurchaseOrder) => void;
}) {
  const [supplier, setSupplier] = React.useState("");
  const [lines, setLines] = React.useState<{ productId: string; qty: string }[]>([
    { productId: "", qty: "" },
  ]);

  React.useEffect(() => {
    if (open) setLines([{ productId: "", qty: "" }]);
  }, [open]);

  const rows = lines.map((l) => ({ ...l, product: null as any, qtyNum: parseInt(l.qty) || 0 }));
  const total = rows.reduce((a, r) => a + (r.product && r.product.cost ? r.qtyNum * r.product.cost : 0), 0);
  const valid = supplier && rows.some((r) => r.product && r.qtyNum > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>New purchase order</DialogTitle>
          <DialogDescription>Restock products from a supplier</DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <FormField label="Supplier" htmlFor="po-supplier">
            <Input id="po-supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Enter supplier name" />
          </FormField>

          <div className="space-y-2.5">
            <p className="text-[13px] font-medium">Items</p>
            {rows.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    aria-label={`Product ${i + 1}`}
                    value={r.productId}
                    onChange={(e) => {
                      const next = [...lines];
                      next[i] = { ...next[i], productId: e.target.value };
                      setLines(next);
                    }}
                    placeholder="Enter product name"
                  />
                </div>
                <Input
                  aria-label={`Quantity ${i + 1}`}
                  inputMode="numeric"
                  placeholder="Qty"
                  className="w-20 tabular-nums"
                  value={r.qty}
                  onChange={(e) => {
                    const next = [...lines];
                    next[i] = { ...next[i], qty: e.target.value.replace(/[^0-9]/g, "") };
                    setLines(next);
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove item ${i + 1}`}
                  disabled={lines.length <= 1}
                  className="text-muted-foreground"
                  onClick={() => setLines(lines.filter((_, j) => j !== i))}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLines([...lines, { productId: "", qty: "" }])}
            >
              <Plus /> Add item
            </Button>
          </div>

          <div className="flex justify-between rounded-lg border border-border bg-muted/30 px-3.5 py-3 font-semibold">
            <span>Estimated total</span>
            <span className="tabular-nums">{formatKES(total)}</span>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              const po: PurchaseOrder = {
                id: `PO-${1000 + Math.floor(Math.random() * 50)}`,
                supplier,
                items: rows
                  .filter((r) => r.product && r.qtyNum > 0)
                  .map((r) => ({
                    productId: (r.product as any)?.id || "",
                    name: (r.product as any)?.name || "",
                    sku: (r.product as any)?.sku || "",
                    qty: r.qtyNum,
                    unitCost: (r.product as any)?.cost || 0,
                  })),
                total,
                orderDate: new Date().toISOString(),
                expectedDate: isoAhead({ days: 4 }),
                status: "draft",
                branch: "Main Branch",
              };
              onCreate(po);
            }}
          >
            <CheckCircle2 /> Create order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeftRight,
  Banknote,
  Boxes,
  ClipboardCheck,
  MoreHorizontal,
  PackageMinus,
  PackagePlus,
  RotateCcw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ProductThumb } from "@/components/shared/ProductThumb";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField, Input, Textarea } from "@/components/ui/input";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { stockStatusOf } from "@/lib/utils/products";
import { branches } from "@/lib/constants";

import { formatKES, formatDate, uid } from "@/lib/utils";
import { useSimulatedLoading } from "@/lib/hooks";
import type { InventoryTransaction, InventoryTxType, Product } from "@/types";

type StockAction = "receive" | "adjust" | "transfer";

export default function InventoryPage() {
  return (
    <React.Suspense fallback={null}>
      <InventoryInner />
    </React.Suspense>
  );
}

function InventoryInner() {
  const params = useSearchParams();
  const loading = useSimulatedLoading(500);
  const [items, setItems] = React.useState<Product[]>([]);
  const [transactions, setTransactions] = React.useState<InventoryTransaction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [locationFilter, setLocationFilter] = React.useState("all");
  const [action, setAction] = React.useState<StockAction | null>(null);
  const [countOpen, setCountOpen] = React.useState(false);
  const [receiveTarget, setReceiveTarget] = React.useState<Product | null>(null);

  React.useEffect(() => {
    if (params.get("action") === "receive") setAction("receive");
    if (params.get("filter") === "low") setStatusFilter("low_stock");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch data on mount
  React.useEffect(() => {
    setItems([]);
    setTransactions([]);
    setIsLoading(false);
  }, []);

  const totals = React.useMemo(() => {
    const active = items.filter((p) => p.status === "active");
    return {
      stockValue: active.reduce((a, p) => a + p.stock * p.cost, 0),
      retailValue: active.reduce((a, p) => a + p.stock * p.price, 0),
      totalProducts: active.length,
      lowStock: active.filter((p) => stockStatusOf(p) === "low_stock").length,
      outOfStock: active.filter((p) => stockStatusOf(p) === "out_of_stock").length,
      totalUnits: active.reduce((a, p) => a + p.stock, 0),
    };
  }, [items]);

  const filtered = React.useMemo(
    () =>
      items.filter((p) => {
        if (p.status !== "active") return false;
        if (statusFilter !== "all" && stockStatusOf(p) !== statusFilter) return false;
        if (locationFilter !== "all" && p.location !== locationFilter) return false;
        return true;
      }),
    [items, statusFilter, locationFilter]
  );

  function handleStockUpdate(
    tx: Omit<InventoryTransaction, "id" | "date" | "createdBy">,
    product: Product
  ) {
    // Local operation - update state directly
    setItems(prev => prev.map(p => p.id === product.id ? { ...p, stock: p.stock + tx.qty } : p));
    const newTx: InventoryTransaction = {
      id: uid("tx"),
      date: new Date().toISOString(),
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      qty: tx.qty,
      type: tx.type,
      previousStock: product.stock,
      newStock: product.stock + tx.qty,
      createdBy: "Current User",
      reference: tx.reference || '',
      note: tx.note
    };
    setTransactions(prev => [newTx, ...prev]);
    toast.success('Stock updated successfully');
  }

  const columns: ColumnDef<Product>[] = [
    {
      id: "product",
      header: "Product",
      accessor: (r) => r.name,
      sortable: true,
      cell: (r) => (
        <div className="flex items-center gap-3">
          <ProductThumb category={r.category} imageUrl={r.imageUrl} className="size-9 shrink-0" />
          <div className="min-w-0">
            <p className="max-w-[200px] truncate font-medium">{r.name}</p>
            <p className="font-mono text-[11px] text-muted-foreground">{r.sku}</p>
          </div>
        </div>
      ),
    },
    {
      id: "stock",
      header: "Current stock",
      accessor: (r) => r.stock,
      align: "right",
      sortable: true,
      cell: (r) => (
        <span className="font-semibold tabular-nums">
          {r.stock} <span className="text-xs font-normal text-muted-foreground">{r.unit}</span>
        </span>
      ),
    },
    {
      id: "min",
      header: "Min stock",
      accessor: (r) => r.minStock,
      align: "right",
      hideBelow: "lg",
      cell: (r) => <span className="tabular-nums text-muted-foreground">{r.minStock}</span>,
    },
    {
      id: "value",
      header: "Stock value",
      accessor: (r) => r.stock * r.cost,
      align: "right",
      sortable: true,
      cell: (r) => <span className="tabular-nums">{formatKES(r.stock * r.cost)}</span>,
    },
    {
      id: "location",
      header: "Location",
      accessor: (r) => r.location,
      hideBelow: "xl",
      cell: (r) => <span className="text-muted-foreground">{r.location}</span>,
    },
    {
      id: "status",
      header: "Status",
      accessor: (r) => stockStatusOf(r),
      sortable: true,
      cell: (r) => <StatusBadge status={stockStatusOf(r)} dot />,
    },
    {
      id: "updated",
      header: "Last updated",
      accessor: (r) => r.updatedAt,
      sortable: true,
      hideBelow: "xl",
      cell: (r) => <span className="text-muted-foreground">{formatDate(r.updatedAt)}</span>,
    },
  ];

  const txColumns: ColumnDef<InventoryTransaction>[] = [
    {
      id: "date",
      header: "Date",
      accessor: (r) => r.date,
      sortable: true,
      cell: (r) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(r.date, true)}</span>,
    },
    {
      id: "product",
      header: "Product",
      accessor: (r) => r.productName,
      cell: (r) => (
        <div className="min-w-0">
          <p className="max-w-[200px] truncate font-medium">{r.productName}</p>
          <p className="font-mono text-[11px] text-muted-foreground">{r.sku}</p>
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      accessor: (r) => r.type,
      cell: (r) => <TxTypeBadge type={r.type} />,
    },
    {
      id: "qty",
      header: "Qty",
      accessor: (r) => r.qty,
      align: "right",
      sortable: true,
      cell: (r) => (
        <span
          className={
            "inline-flex items-center gap-1 font-semibold tabular-nums " +
            (r.qty > 0 ? "text-emerald-700" : "text-red-700")
          }
        >
          {r.qty > 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
          {r.qty > 0 ? "+" : ""}
          {r.qty}
        </span>
      ),
    },
    {
      id: "movement",
      header: "Stock change",
      accessor: (r) => r.newStock,
      hideBelow: "md",
      cell: (r) => (
        <span className="whitespace-nowrap tabular-nums text-muted-foreground">
          {r.previousStock} → <strong className="text-foreground">{r.newStock}</strong>
        </span>
      ),
    },
    {
      id: "user",
      header: "User",
      accessor: (r) => r.createdBy,
      hideBelow: "lg",
      cell: (r) => r.createdBy,
    },
    {
      id: "reference",
      header: "Reference",
      accessor: (r) => r.reference,
      hideBelow: "xl",
      cell: (r) => (
        <span className="font-mono text-xs text-muted-foreground" title={r.note}>
          {r.reference}
        </span>
      ),
    },
  ];

  return (
    <div className="page space-y-5">
      <PageHeader
        title="Inventory"
        description="Track stock levels, movements and valuations across all locations"
        actions={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreHorizontal /> More actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setAction("adjust")}>
                  <RotateCcw /> Stock adjustment
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setAction("transfer")}>
                  <ArrowLeftRight /> Stock transfer
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setCountOpen(true)}>
                  <ClipboardCheck /> Stock count
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setAction("receive")}>
              <PackagePlus /> Receive Stock
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <MetricCard
          loading={loading}
          label="Total Stock Value"
          value={formatKES(totals.stockValue)}
          icon={Banknote}
          footer={
            <p className="text-xs text-muted-foreground tabular-nums">
              Retail value {formatKES(totals.retailValue)} · {totals.totalUnits.toLocaleString()} units
            </p>
          }
        />
        <MetricCard
          loading={loading}
          label="Total Products"
          value={String(totals.totalProducts)}
          icon={Boxes}
          iconTone="info"
        />
        <MetricCard
          loading={loading}
          label="Low-stock Products"
          value={String(totals.lowStock)}
          icon={PackageMinus}
          iconTone="warning"
          footer={
            <button
              onClick={() => setStatusFilter("low_stock")}
              className="text-xs font-medium text-primary hover:underline"
            >
              Filter low stock →
            </button>
          }
        />
        <MetricCard
          loading={loading}
          label="Out of Stock"
          value={String(totals.outOfStock)}
          icon={PackageMinus}
          iconTone="destructive"
        />
      </div>

      <Tabs defaultValue="levels">
        <TabsList variant="underline">
          <TabsTrigger variant="underline" value="levels">
            Stock levels
          </TabsTrigger>
          <TabsTrigger variant="underline" value="history">
            Inventory history
          </TabsTrigger>
        </TabsList>

        <TabsContent value="levels">
          <DataTable
            columns={columns}
            data={filtered}
            rowKey={(r) => r.id}
            loading={loading || isLoading}
            searchable="Search products…"
            pageSize={10}
            defaultSort={{ id: "stock", dir: "asc" }}
            emptyTitle="No products match"
            emptyDescription="Adjust the stock or location filters to see more products."
            filters={
              <>
                <NativeSelect
                  aria-label="Stock status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-[140px]"
                >
                  <option value="all">All statuses</option>
                  <option value="in_stock">In stock</option>
                  <option value="low_stock">Low stock</option>
                  <option value="out_of_stock">Out of stock</option>
                </NativeSelect>
                <NativeSelect
                  aria-label="Location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-[150px]"
                >
                  <option value="all">All locations</option>
                  {branches.map((b) => (
                    <option key={b.id}>{b.name}</option>
                  ))}
                </NativeSelect>
              </>
            }
            mobileCard={(r) => (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <ProductThumb category={r.category} imageUrl={r.imageUrl} className="size-10 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium">{r.name}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{r.sku}</p>
                  </div>
                  <span className="font-semibold tabular-nums">
                    {r.stock} {r.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <StatusBadge status={stockStatusOf(r)} dot />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReceiveTarget(r);
                      setAction("receive");
                    }}
                  >
                    <PackagePlus /> Receive
                  </Button>
                </div>
              </div>
            )}
          />
        </TabsContent>

        <TabsContent value="history">
          <DataTable
            columns={txColumns}
            data={transactions}
            rowKey={(r) => r.id}
            loading={loading || isLoading}
            searchable="Search product or reference…"
            pageSize={10}
            emptyTitle="No inventory movements yet"
            emptyDescription="Stock changes from sales, purchases and adjustments will appear here."
            mobileCard={(r) => (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13.5px] font-medium">{r.productName}</span>
                  <span
                    className={
                      "font-semibold tabular-nums " + (r.qty > 0 ? "text-emerald-700" : "text-red-700")
                    }
                  >
                    {r.qty > 0 ? "+" : ""}
                    {r.qty}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <TxTypeBadge type={r.type} />
                  <span className="tabular-nums">
                    {r.previousStock} → {r.newStock}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {formatDate(r.date, true)} · {r.createdBy} · {r.reference}
                </p>
              </div>
            )}
          />
        </TabsContent>
      </Tabs>

      {/* Stock action dialogs */}
      <StockActionDialog
        action={action}
        products={items}
        presetProduct={receiveTarget}
        onClose={() => {
          setAction(null);
          setReceiveTarget(null);
        }}
        onApply={async (tx, product, newStock) => {
          await handleStockUpdate(tx, product);
        }}
      />

      <ConfirmationDialog
        open={countOpen}
        onOpenChange={setCountOpen}
        title="Start stock count?"
        description="A new stock count session will be created. You'll be able to scan or enter counted quantities per product."
        confirmLabel="Start count"
        onConfirm={() => {
          setCountOpen(false);
          toast.success("Stock count started", {
            description: "Stock count session created.",
          });
        }}
      />
    </div>
  );
}

function TxTypeBadge({ type }: { type: InventoryTxType }) {
  const map: Record<InventoryTxType, { label: string; cls: string; dot: string }> = {
    purchase: { label: "Purchase", cls: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
    sale: { label: "Sale", cls: "bg-sky-50 text-sky-700", dot: "bg-sky-500" },
    adjustment: { label: "Adjustment", cls: "bg-amber-50 text-amber-800", dot: "bg-amber-500" },
    transfer: { label: "Transfer", cls: "bg-violet-50 text-violet-700", dot: "bg-violet-500" },
    return: { label: "Return", cls: "bg-slate-100 text-slate-700", dot: "bg-slate-500" },
  };
  const m = map[type];
  return (
    <span className={"inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium " + m.cls}>
      <span className={"size-1.5 rounded-full " + m.dot} />
      {m.label}
    </span>
  );
}

function StockActionDialog({
  action,
  products,
  presetProduct,
  onClose,
  onApply,
}: {
  action: StockAction | null;
  products: Product[];
  presetProduct: Product | null;
  onClose: () => void;
  onApply: (
    tx: Omit<InventoryTransaction, "id" | "date" | "createdBy">,
    product: Product,
    newStock: number
  ) => void;
}) {
  const [productId, setProductId] = React.useState("");
  const [qty, setQty] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [note, setNote] = React.useState("");
  const [reason, setReason] = React.useState("Count variance");
  const [toBranch, setToBranch] = React.useState(branches[1]?.name ?? "");

  React.useEffect(() => {
    if (action) {
      setProductId(presetProduct?.id ?? "");
      setQty("");
      setReference("");
      setNote("");
      setReason("Count variance");
      setToBranch(branches[1]?.name ?? "");
    }
  }, [action, presetProduct]);

  const product = products.find((p) => p.id === productId);
  const qtyNum = parseInt(qty) || 0;
  const valid =
    product &&
    qtyNum > 0 &&
    (action !== "adjust" || reason !== "") &&
    (action !== "transfer" || toBranch !== product?.location);

  const titles: Record<StockAction, string> = {
    receive: "Receive stock",
    adjust: "Stock adjustment",
    transfer: "Stock transfer",
  };
  const descriptions: Record<StockAction, string> = {
    receive: "Add stock received from a supplier purchase order.",
    adjust: "Correct stock levels after damage, loss or a count variance.",
    transfer: "Move stock between locations. Both branches are updated.",
  };

  function submit() {
    if (!product || !action) return;
    if (action === "receive") {
      onApply(
        {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          type: "purchase",
          qty: qtyNum,
          previousStock: product.stock,
          newStock: product.stock + qtyNum,
          reference: reference || `PO-${1000 + Math.floor(Math.random() * 90)}`,
          note: note || undefined,
        },
        product,
        product.stock + qtyNum
      );
      toast.success("Stock received", { description: `+${qtyNum} × ${product.name}` });
    } else if (action === "adjust") {
      onApply(
        {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          type: "adjustment",
          qty: -qtyNum,
          previousStock: product.stock,
          newStock: Math.max(0, product.stock - qtyNum),
          reference: `ADJ-${100 + Math.floor(Math.random() * 900)}`,
          note: `${reason}${note ? " — " + note : ""}`,
        },
        product,
        Math.max(0, product.stock - qtyNum)
      );
      toast.success("Stock adjusted", { description: `${product.name} · ${reason}` });
    } else {
      onApply(
        {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          type: "transfer",
          qty: -qtyNum,
          previousStock: product.stock,
          newStock: Math.max(0, product.stock - qtyNum),
          reference: `TRF-${100 + Math.floor(Math.random() * 900)}`,
          note: `${product.location} → ${toBranch}`,
        },
        product,
        Math.max(0, product.stock - qtyNum)
      );
      toast.success("Transfer recorded", { description: `${qtyNum} × ${product.name} → ${toBranch}` });
    }
    onClose();
  }

  return (
    <Dialog open={Boolean(action)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>{action ? titles[action] : ""}</DialogTitle>
          <DialogDescription>{action ? descriptions[action] : ""}</DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-3.5">
          <FormField label="Product" htmlFor="inv-product" required>
            <NativeSelect
              id="inv-product"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">Select a product…</option>
              {products
                .filter((p) => p.status === "active")
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku}) — {p.stock} {p.unit} in stock
                  </option>
                ))}
            </NativeSelect>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField
              label={action === "receive" ? "Quantity received" : action === "adjust" ? "Quantity to write off" : "Quantity to transfer"}
              htmlFor="inv-qty"
              required
              hint={product ? `Current stock: ${product.stock} ${product.unit}` : undefined}
            >
              <Input
                id="inv-qty"
                inputMode="numeric"
                value={qty}
                onChange={(e) => setQty(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="0"
                className="tabular-nums"
              />
            </FormField>

            {action === "adjust" && (
              <FormField label="Reason" htmlFor="inv-reason">
                <NativeSelect id="inv-reason" value={reason} onChange={(e) => setReason(e.target.value)}>
                  <option>Count variance</option>
                  <option>Damaged</option>
                  <option>Expired</option>
                  <option>Theft / loss</option>
                  <option>Supplier return</option>
                </NativeSelect>
              </FormField>
            )}
            {action === "receive" && (
              <FormField label="Reference (PO)" htmlFor="inv-ref" hint="Optional purchase order number">
                <Input
                  id="inv-ref"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. PO-1042"
                />
              </FormField>
            )}
            {action === "transfer" && (
              <FormField label="Destination" htmlFor="inv-dest" required>
                <NativeSelect id="inv-dest" value={toBranch} onChange={(e) => setToBranch(e.target.value)}>
                  {branches
                    .filter((b) => b.name !== product?.location)
                    .map((b) => (
                      <option key={b.id}>{b.name}</option>
                    ))}
                </NativeSelect>
              </FormField>
            )}
          </div>

          <FormField label="Note" htmlFor="inv-note" hint="Optional context saved with this transaction">
            <Textarea
              id="inv-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Delivered by Brookside route van"
            />
          </FormField>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!valid} onClick={submit}>
            {action === "receive" ? "Receive stock" : action === "adjust" ? "Apply adjustment" : "Transfer stock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  Archive,
  Copy,
  Download,
  LayoutGrid,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Table2,
  Trash2,
  Upload,
  Eye,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ProductThumb } from "@/components/shared/ProductThumb";
import { StockChip } from "@/components/pos/ProductGrid";
import { ProductFormDialog } from "@/components/products/ProductFormDialog";
import { ProductDetailSheet } from "@/components/products/ProductDetailSheet";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { stockStatusOf, STOCK_STATUS_META } from "@/lib/utils/products";
import { getProducts as getSupabaseProducts, createProduct, updateProduct, deleteProduct, subscribeToProducts, unsubscribeFromProducts } from "@/lib/api/products";
import { cn, downloadCSV, formatKES, formatDate } from "@/lib/utils";
import { useSimulatedLoading } from "@/lib/hooks";
import type { Product } from "@/types";

export default function ProductsPage() {
  return (
    <React.Suspense fallback={null}>
      <ProductsInner />
    </React.Suspense>
  );
}

function ProductsInner() {
  const params = useSearchParams();
  const loading = useSimulatedLoading(550);

  const [items, setItems] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [category, setCategory] = React.useState("all");
  const [stockFilter, setStockFilter] = React.useState("all");
  const [view, setView] = React.useState<"table" | "grid">("table");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [detail, setDetail] = React.useState<Product | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Product[] | null>(null);
  const searchParam = params.get("q");
  const subscriptionRef = React.useRef<any>(null);
  void searchParam;

  // Deep links: /products?new=1 and /products?q=SKU
  React.useEffect(() => {
    if (params.get("new")) {
      setEditing(null);
      setFormOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch products on mount
  React.useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getSupabaseProducts();
        setItems(data.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();

    // Set up real-time subscription (separate from data fetch to avoid duplicate subscriptions)
    if (!subscriptionRef.current) {
      const channel = subscribeToProducts((updatedProducts) => {
        setItems(updatedProducts.sort((a, b) => a.name.localeCompare(b.name)));
      });
      subscriptionRef.current = channel;
    }

    // Cleanup subscription on unmount
    return () => {
      if (subscriptionRef.current) {
        unsubscribeFromProducts(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, []);

  const filtered = React.useMemo(
    () =>
      items.filter((p) => {
        if (category !== "all" && p.category !== category) return false;
        if (stockFilter !== "all" && stockStatusOf(p) !== stockFilter) return false;
        return true;
      }),
    [items, category, stockFilter]
  );

  async function saveProduct(p: Product) {
    try {
      if (items.some((x) => x.id === p.id)) {
        await updateProduct(p.id, p);
        toast.success('Product updated');
      } else {
        await createProduct(p);
        toast.success('Product created');
      }
      // Refresh list
      const updated = await getSupabaseProducts();
      setItems(updated.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Failed to save product:', error);
      toast.error('Failed to save product');
    }
  }

  function duplicate(p: Product) {
    const copy: Product = {
      ...p,
      id: `${p.id}-copy-${Date.now().toString(36)}`,
      name: `${p.name} (Copy)`,
      sku: `${p.sku}-C`,
      stock: 0,
      sold: 0,
      status: "active",
      updatedAt: new Date().toISOString(),
    };
    saveProduct(copy);
    toast.success("Product duplicated", { description: `${copy.name} created as a draft copy.` });
  }

  async function archive(rows: Product[]) {
    try {
      for (const row of rows) {
        await updateProduct(row.id, { status: "archived" });
      }
      // Refresh list
      const updated = await getSupabaseProducts();
      setItems(updated.sort((a, b) => a.name.localeCompare(b.name)));
      toast.success(rows.length === 1 ? "Product archived" : `${rows.length} products archived`);
    } catch (error) {
      console.error('Failed to archive products:', error);
      toast.error('Failed to archive products');
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      for (const product of pendingDelete) {
        await deleteProduct(product.id);
      }
      // Refresh list
      const updated = await getSupabaseProducts();
      setItems(updated.sort((a, b) => a.name.localeCompare(b.name)));
      toast.success(
        pendingDelete.length === 1 ? "Product deleted" : `${pendingDelete.length} products deleted`
      );
      setPendingDelete(null);
    } catch (error) {
      console.error('Failed to delete products:', error);
      toast.error('Failed to delete products');
    }
  }

  function exportCsv(rows: Product[]) {
    downloadCSV("zimora-products.csv", [
      ["Name", "SKU", "Barcode", "Category", "Selling Price", "Cost Price", "Stock", "Status", "Updated"],
      ...rows.map((p) => [
        p.name,
        p.sku,
        p.barcode,
        p.category,
        p.price,
        p.cost,
        p.stock,
        p.status,
        new Date(p.updatedAt).toISOString(),
      ]),
    ]);
    toast.success("Export started", { description: "zimora-products.csv downloaded." });
  }

  const columns: ColumnDef<Product>[] = [
    {
      id: "product",
      header: "Product",
      accessor: (r) => r.name,
      sortable: true,
      cell: (r) => (
        <div className="flex items-center gap-3">
          <ProductThumb category={r.category} className="size-9 shrink-0" />
          <div className="min-w-0">
            <p className="max-w-[220px] truncate font-medium">{r.name}</p>
            <p className="text-xs text-muted-foreground">{r.brand ?? "Generic"}</p>
          </div>
        </div>
      ),
    },
    {
      id: "sku",
      header: "SKU",
      accessor: (r) => r.sku,
      sortable: true,
      cell: (r) => <span className="font-mono text-xs">{r.sku}</span>,
    },
    {
      id: "barcode",
      header: "Barcode",
      accessor: (r) => r.barcode,
      hideBelow: "xl",
      cell: (r) => <span className="font-mono text-xs text-muted-foreground">{r.barcode}</span>,
    },
    {
      id: "category",
      header: "Category",
      accessor: (r) => r.category,
      sortable: true,
      cell: (r) => <span className="text-muted-foreground">{r.category}</span>,
    },
    {
      id: "price",
      header: "Selling",
      accessor: (r) => r.price,
      align: "right",
      sortable: true,
      cell: (r) => <span className="font-medium tabular-nums">{formatKES(r.price)}</span>,
    },
    {
      id: "cost",
      header: "Cost",
      accessor: (r) => r.cost,
      align: "right",
      hideBelow: "lg",
      cell: (r) => <span className="tabular-nums text-muted-foreground">{formatKES(r.cost)}</span>,
    },
    {
      id: "stock",
      header: "Stock",
      accessor: (r) => r.stock,
      sortable: true,
      align: "right",
      cell: (r) => (
        <div className="flex items-center justify-end gap-2">
          <span className="tabular-nums">{r.stock}</span>
          <StockChip status={stockStatusOf(r)} stock={r.stock} />
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessor: (r) => r.status,
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      id: "updated",
      header: "Updated",
      accessor: (r) => r.updatedAt,
      sortable: true,
      hideBelow: "xl",
      cell: (r) => <span className="text-muted-foreground">{formatDate(r.updatedAt)}</span>,
    },
  ];

  return (
    <div className="page space-y-5">
      <PageHeader
        title="Products"
        description={`${items.filter((p) => p.status === "active").length} active products in your catalog`}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              className="max-sm:hidden"
            >
              <Upload /> Import
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More actions">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => exportCsv(items)}>
                  <Download /> Export all (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => toast.success("Preparing PDF catalog…")}>
                  <Printer /> Print catalog
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setView("table")}>
                  <Table2 /> Table view
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setView("grid")}>
                  <LayoutGrid /> Grid view
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus /> <span className="hidden sm:inline">Add Product</span>
            </Button>
          </>
        }
      />

      {view === "table" ? (
        <DataTable
          columns={columns}
          data={filtered}
          rowKey={(r) => r.id}
          loading={loading || isLoading}
          searchable="Search name, SKU or barcode…"
          pageSize={10}
          selectable
          defaultSort={{ id: "product", dir: "asc" }}
          emptyIcon={Package}
          emptyTitle="No products found"
          emptyDescription="Try adjusting your filters, or add a new product to your catalog."
          emptyAction={
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus /> Add Product
            </Button>
          }
          filters={
            <>
              <NativeSelect
                aria-label="Filter by category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-[150px]"
              >
                <option value="all">All categories</option>
                {Array.from(new Set(items.map((p) => p.category))).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </NativeSelect>
              <NativeSelect
                aria-label="Filter by stock status"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-[140px]"
              >
                <option value="all">Any stock level</option>
                <option value="in_stock">In stock</option>
                <option value="low_stock">Low stock</option>
                <option value="out_of_stock">Out of stock</option>
              </NativeSelect>
            </>
          }
          renderBulkActions={(selected, clear) => {
            const rows = items.filter((p) => selected.includes(p.id));
            return (
              <>
                <Button variant="outline" size="sm" onClick={() => exportCsv(rows)}>
                  <Download /> Export
                </Button>
                <Button variant="outline" size="sm" onClick={() => { archive(rows); clear(); }}>
                  <Archive /> Archive
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setPendingDelete(rows)}>
                  <Trash2 /> Delete
                </Button>
              </>
            );
          }}
          mobileCard={(r) => (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <ProductThumb category={r.category} className="size-10 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium">{r.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{r.sku}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold tabular-nums">{formatKES(r.price)}</span>
                <StockChip status={stockStatusOf(r)} stock={r.stock} />
              </div>
              <StatusBadge status={r.status} />
            </div>
          )}
          onRowClick={(r) => setDetail(r)}
          rowActions={(r) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${r.name}`}>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setDetail(r)}>
                  <Eye /> View
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    setEditing(r);
                    setFormOpen(true);
                  }}
                >
                  <Pencil /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => duplicate(r)}>
                  <Copy /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => archive([r])}
                  disabled={r.status === "archived"}
                >
                  <Archive /> Archive
                </DropdownMenuItem>
                <DropdownMenuItem destructive onSelect={() => setPendingDelete([r])}>
                  <Trash2 /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          footer={
            <span>
              Stock value of listed products:{" "}
              <strong className="text-foreground tabular-nums">
                {formatKES(filtered.reduce((a, p) => a + p.stock * p.cost, 0))}
              </strong>
            </span>
          }
        />
      ) : (
        <ProductGridView items={filtered} loading={loading} onOpen={setDetail} />
      )}

      {/* Toolbar note for mobile grid switch */}
      <p className="text-center text-xs text-muted-foreground lg:hidden">
        Tip: use the <strong>⋯</strong> menu to switch between table and grid view
      </p>

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editing}
        onSave={saveProduct}
      />
      <ProductDetailSheet
        product={detail}
        onOpenChange={(open) => !open && setDetail(null)}
        onEdit={(p) => {
          setDetail(null);
          setEditing(p);
          setFormOpen(true);
        }}
      />
      <ConfirmationDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={pendingDelete && pendingDelete.length > 1 ? `Delete ${pendingDelete.length} products?` : "Delete product?"}
        description="This action cannot be undone. All product information associated with this item will be permanently removed."
        confirmLabel="Delete Product"
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function ProductGridView({
  items,
  loading,
  onOpen,
}: {
  items: Product[];
  loading: boolean;
  onOpen: (p: Product) => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-52 animate-pulse rounded-xl border border-border bg-card" />
        ))}
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card py-16 text-center">
        <Package className="mx-auto size-8 text-muted-foreground" />
        <h3 className="mt-3 font-semibold">No products match your filters</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">Adjust filters or add a new product.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5">
      {items.map((p) => (
        <button
          key={p.id}
          onClick={() => onOpen(p)}
          className="group rounded-xl border border-border bg-card p-4 text-left shadow-card outline-none transition-all hover:-translate-y-0.5 hover:shadow-pop focus-ring"
        >
          <div className="flex items-start justify-between">
            <ProductThumb category={p.category} className="size-12" />
            <StatusBadge status={p.status} />
          </div>
          <p className="mt-3 line-clamp-2 min-h-[2.5em] text-[13.5px] font-medium leading-snug">{p.name}</p>
          <p className="font-mono text-[11px] text-muted-foreground">{p.sku}</p>
          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[15px] font-semibold tabular-nums">{formatKES(p.price)}</span>
            <span
              className={cn(
                "text-xs font-medium tabular-nums",
                stockStatusOf(p) === "out_of_stock" && "text-red-600",
                stockStatusOf(p) === "low_stock" && "text-amber-600",
                stockStatusOf(p) === "in_stock" && "text-emerald-600"
              )}
            >
              {STOCK_STATUS_META[stockStatusOf(p)].label === "In Stock" ? `${p.stock} in stock` : STOCK_STATUS_META[stockStatusOf(p)].label}
            </span>
          </div>
          <span className="mt-3 flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            <Eye className="size-3.5" /> View details <Pencil className="ml-2 size-3.5" /> Edit
          </span>
        </button>
      ))}
    </div>
  );
}

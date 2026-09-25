"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Download, Eye, MoreHorizontal, Printer, RotateCcw, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { StatusBadge, PaymentBadge } from "@/components/shared/StatusBadge";
import { MetricCard } from "@/components/shared/MetricCard";
import { SaleDetailSheet } from "@/components/sales/SaleDetailSheet";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/misc";
import { downloadCSV, formatKES, formatDate } from "@/lib/utils";
import { useSimulatedLoading } from "@/lib/hooks";
import type { Sale, Product } from "@/types";

export default function SalesPage() {
  return (
    <React.Suspense fallback={null}>
      <SalesInner />
    </React.Suspense>
  );
}

function SalesInner() {
  const params = useSearchParams();
  const loading = useSimulatedLoading(500);
  const [rows, setRows] = React.useState<Sale[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [payment, setPayment] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [cashier, setCashier] = React.useState("all");
  const [branch, setBranch] = React.useState("all");
  const [detail, setDetail] = React.useState<Sale | null>(null);

  React.useEffect(() => {
    const order = params.get("order");
    if (order) {
      const found = rows.find((s) => s.id === order || s.orderNo === order);
      if (found) setDetail(found);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  React.useEffect(() => {
    setRows([]);
    setProducts([]);
  }, []);

  const filtered = React.useMemo(
    () =>
      rows.filter((s) => {
        if (payment !== "all" && s.paymentMethod !== payment) return false;
        if (status !== "all" && s.status !== status) return false;
        if (cashier !== "all" && s.cashier !== cashier) return false;
        if (branch !== "all" && s.branch !== branch) return false;
        return true;
      }),
    [rows, payment, status, cashier, branch]
  );

  const stats = React.useMemo(() => {
    const completed = filtered.filter((s) => s.status === "completed");
    const total = completed.reduce((a, s) => a + s.total, 0);
    return {
      count: filtered.length,
      revenue: total,
      avg: completed.length ? Math.round(total / completed.length) : 0,
      refunds: filtered.filter((s) => s.status === "refunded").length,
    };
  }, [filtered]);

  function refund(sale: Sale) {
    // Local operation - update state directly
    setRows(prev => prev.map(s => s.id === sale.id ? { ...s, status: "refunded" } : s));
    toast.success("Sale refunded", { description: `${sale.orderNo} has been refunded.` });
  }

  function exportCsv() {
    downloadCSV("zimora-sales.csv", [
      ["Order", "Date", "Customer", "Cashier", "Items", "Payment", "Amount (KES)", "Status"],
      ...filtered.map((s) => [
        s.orderNo,
        new Date(s.date).toISOString(),
        s.customerName,
        s.cashier,
        s.items.reduce((a, i) => a + i.qty, 0),
        s.paymentMethod,
        s.total,
        s.status,
      ]),
    ]);
    toast.success("Export started", { description: "zimora-sales.csv downloaded." });
  }

  const columns: ColumnDef<Sale>[] = [
    {
      id: "order",
      header: "Order ID",
      accessor: (r) => r.orderNo,
      sortable: true,
      cell: (r) => <span className="font-medium">{r.orderNo}</span>,
    },
    {
      id: "date",
      header: "Date",
      accessor: (r) => r.date,
      sortable: true,
      cell: (r) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(r.date, true)}</span>,
    },
    {
      id: "customer",
      header: "Customer",
      accessor: (r) => r.customerName,
      cell: (r) => (
        <span className="flex items-center gap-2">
          <Avatar name={r.customerName} size={6} />
          <span className="max-w-[130px] truncate">{r.customerName}</span>
        </span>
      ),
    },
    {
      id: "cashier",
      header: "Cashier",
      accessor: (r) => r.cashier,
      hideBelow: "lg",
      cell: (r) => <span className="text-muted-foreground">{r.cashier}</span>,
    },
    {
      id: "items",
      header: "Items",
      accessor: (r) => r.items.reduce((a, i) => a + i.qty, 0),
      align: "right",
      hideBelow: "md",
      cell: (r) => <span className="tabular-nums text-muted-foreground">{r.items.reduce((a, i) => a + i.qty, 0)}</span>,
    },
    {
      id: "payment",
      header: "Payment",
      accessor: (r) => r.paymentMethod,
      cell: (r) => <PaymentBadge method={r.paymentMethod} />,
    },
    {
      id: "amount",
      header: "Amount",
      accessor: (r) => r.total,
      align: "right",
      sortable: true,
      cell: (r) => <span className="font-semibold tabular-nums">{formatKES(r.total)}</span>,
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
        title="Sales"
        description="Every transaction across your tills, searchable and exportable"
        actions={
          <>
            <Button variant="outline" onClick={exportCsv}>
              <Download /> Export
            </Button>
            <Button asChild>
              <a href="/pos">New Sale</a>
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <MetricCard loading={loading} label="Sales (filtered)" value={formatKES(stats.revenue)} icon={ReceiptText} />
        <MetricCard loading={loading} label="Orders" value={String(stats.count)} icon={ReceiptText} iconTone="info" />
        <MetricCard
          loading={loading}
          label="Average order"
          value={formatKES(stats.avg)}
          icon={ReceiptText}
          iconTone="default"
        />
        <MetricCard loading={loading} label="Refunds" value={String(stats.refunds)} icon={RotateCcw} iconTone="warning" />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(r) => r.id}
        loading={loading}
        searchable="Search order, customer or cashier…"
        pageSize={10}
        defaultSort={{ id: "date", dir: "desc" }}
        onRowClick={(r) => setDetail(r)}
        rowActions={(r) => (
          <SalesActionsMenu row={r} onView={() => setDetail(r)} onRefund={() => refund(r)} />
        )}
        emptyTitle="No sales match these filters"
        emptyDescription="Try widening the date range or clearing filters."
        filters={
          <>
            <NativeSelect aria-label="Payment method" value={payment} onChange={(e) => setPayment(e.target.value)} className="w-[130px]">
              <option value="all">All payments</option>
              <option value="cash">Cash</option>
              <option value="mpesa">M-Pesa</option>
              <option value="card">Card</option>
              <option value="split">Split</option>
            </NativeSelect>
            <NativeSelect aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-[130px]">
              <option value="all">Any status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
              <option value="partially_refunded">Partial refund</option>
            </NativeSelect>
            <NativeSelect aria-label="Cashier" value={cashier} onChange={(e) => setCashier(e.target.value)} className="w-[140px] max-lg:hidden">
              <option value="all">All cashiers</option>
            </NativeSelect>
            <NativeSelect aria-label="Branch" value={branch} onChange={(e) => setBranch(e.target.value)} className="w-[140px] max-xl:hidden">
              <option value="all">All branches</option>
            </NativeSelect>
          </>
        }
        renderBulkActions={(_sel, clear) => (
          <Button variant="outline" size="sm" onClick={clear}>
            Clear
          </Button>
        )}
        mobileCard={(r) => (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{r.orderNo}</span>
              <span className="font-semibold tabular-nums">{formatKES(r.total)}</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="truncate">
                {r.customerName} · {r.cashier}
              </span>
              <PaymentBadge method={r.paymentMethod} />
            </div>
            <div className="flex items-center justify-between">
              <StatusBadge status={r.status} />
              <span className="text-[11px] text-muted-foreground">{formatDate(r.date, true)}</span>
            </div>
          </div>
        )}
      />

      <SaleDetailSheet
        sale={detail}
        onOpenChange={(open) => !open && setDetail(null)}
        onRefunded={refund}
        products={products}
      />
    </div>
  );
}

function SalesActionsMenu({ row, onView, onRefund }: { row: Sale; onView: () => void; onRefund: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.orderNo}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onView}>
          <Eye /> View details
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => window.print()}>
          <Printer /> Print receipt
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() =>
            toast.success("Preparing PDF", { description: `${row.orderNo} will download shortly.` })
          }
        >
          <Download /> Download PDF
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive disabled={row.status === "refunded"} onSelect={onRefund}>
          <RotateCcw /> Refund
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

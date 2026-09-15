"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import {
  AlertTriangle,
  Banknote,
  Download,
  Eye,
  FileText,
  Printer,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { PaymentBadge } from "@/components/shared/StatusBadge";
import { ProductThumb } from "@/components/shared/ProductThumb";
import { ChartCard } from "@/components/shared/ChartCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SalesAreaChart, type TrendRange } from "@/components/charts/SalesAreaChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, Skeleton } from "@/components/ui/misc";
import { downloadCSV, formatKES, formatDate } from "@/lib/utils";
import { useSimulatedLoading } from "@/lib/hooks";
import { getSales as getSupabaseSales, subscribeToSales, unsubscribeFromSales } from "@/lib/api/sales";
import { getProducts as getSupabaseProducts, subscribeToProducts, unsubscribeFromProducts } from "@/lib/api/products";
import type { Sale, Product } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const loading = useSimulatedLoading(450);
  const [range, setRange] = React.useState<TrendRange>("week");
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const salesSubscriptionRef = React.useRef<any>(null);
  const productsSubscriptionRef = React.useRef<any>(null);

  // Fetch data on mount
  React.useEffect(() => {
    async function fetchData() {
      try {
        const [salesData, productsData] = await Promise.all([
          getSupabaseSales(),
          getSupabaseProducts()
        ]);
        setSales(salesData);
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();

    // Set up real-time subscriptions (separate from data fetch to avoid duplicate subscriptions)
    if (!salesSubscriptionRef.current) {
      const salesChannel = subscribeToSales((updatedSales) => {
        setSales(updatedSales);
      });
      salesSubscriptionRef.current = salesChannel;
    }

    if (!productsSubscriptionRef.current) {
      const productsChannel = subscribeToProducts((updatedProducts) => {
        setProducts(updatedProducts);
      });
      productsSubscriptionRef.current = productsChannel;
    }

    // Cleanup subscriptions on unmount
    return () => {
      if (salesSubscriptionRef.current) {
        unsubscribeFromSales(salesSubscriptionRef.current);
        salesSubscriptionRef.current = null;
      }
      if (productsSubscriptionRef.current) {
        unsubscribeFromProducts(productsSubscriptionRef.current);
        productsSubscriptionRef.current = null;
      }
    };
  }, []);

  const topProducts = React.useMemo(() => {
    return products
      .filter(p => p.status === "active")
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  }, [products]);

  const maxRevenue = React.useMemo(() => {
    if (topProducts.length === 0) return 1;
    return Math.max(...topProducts.map(p => p.sold * p.price));
  }, [topProducts]);

  const todaySales = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sales.filter(s => new Date(s.date) >= today);
  }, [sales]);

  const stats = React.useMemo(() => {
    const completedSales = sales.filter(s => s.status === "completed");
    const todayCompleted = todaySales.filter(s => s.status === "completed");
    
    return {
      todaySales: todayCompleted.reduce((a, s) => a + s.total, 0),
      totalOrders: sales.length,
      lowStock: products.filter(p => p.stock <= p.minStock).length,
      expenses: 0, // TODO: Integrate with expenses API
      netProfit: todayCompleted.reduce((a, s) => a + s.total, 0), // Simplified - should subtract expenses
    };
  }, [sales, todaySales, products]);

  const columns: ColumnDef<Sale>[] = [
    {
      id: "order",
      header: "Order",
      accessor: (r) => r.orderNo,
      sortable: true,
      cell: (r) => (
        <div>
          <p className="font-medium">{r.orderNo}</p>
          <p className="text-xs text-muted-foreground">{r.items.length} items</p>
        </div>
      ),
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
      cell: (r) => <StatusPill sale={r} />,
    },
    {
      id: "date",
      header: "Date",
      accessor: (r) => r.date,
      hideBelow: "xl",
      cell: (r) => <span className="text-muted-foreground">{formatDate(r.date, true)}</span>,
    },
  ];

  return (
    <div className="page space-y-5">
      <PageHeader
        title="Dashboard"
        description="Here's what's happening with your business today."
        actions={
          <>
            <NativeSelect aria-label="Date range" defaultValue="today" className="w-[140px]">
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
            </NativeSelect>
            <NativeSelect aria-label="Location" defaultValue="all" className="w-[150px] max-sm:hidden">
              <option value="all">All locations</option>
            </NativeSelect>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download /> <span className="max-sm:hidden">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => {
                    downloadCSV(
                      "zimora-sales-today.csv",
                      [
                        ["Order", "Date", "Customer", "Cashier", "Payment", "Amount (KES)", "Status"],
                      ]
                    );
                    toast.success("Export started", { description: "zimora-sales-today.csv downloaded." });
                  }}
                >
                  <FileText /> Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    toast.success("Preparing PDF", { description: "Your dashboard report will download shortly." })
                  }
                >
                  <Printer /> Export PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      {/* KPI cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <MetricCard
          loading={loading || isLoading}
          label="Today's Sales"
          value={formatKES(stats.todaySales)}
          icon={Banknote}
        />
        <MetricCard
          loading={loading || isLoading}
          label="Total Orders"
          value={String(stats.totalOrders)}
          icon={ShoppingCart}
          iconTone="info"
        />
        <MetricCard
          loading={loading || isLoading}
          label="Low Stock Items"
          value={String(stats.lowStock)}
          icon={AlertTriangle}
          iconTone="warning"
          footer={
            <Link href="/inventory?filter=low" className="text-xs font-medium text-primary hover:underline">
              Review stock →
            </Link>
          }
        />
        <MetricCard
          loading={loading || isLoading}
          label="Expenses"
          value={formatKES(stats.expenses)}
          icon={Wallet}
          iconTone="default"
        />
        <MetricCard
          loading={loading || isLoading}
          label="Net Profit"
          value={formatKES(stats.netProfit)}
          icon={TrendingUp}
          iconTone="primary"
          className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-1"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="text-[15px] font-semibold tracking-tight">Sales analytics</h3>
          <p className="mb-1 mt-0.5 text-xs text-muted-foreground">
            Revenue and order volume across all locations
          </p>
          {loading ? (
            <Skeleton className="mt-4 h-[300px] w-full" />
          ) : (
            <div className="mt-4 flex h-[300px] items-center justify-center text-muted-foreground">
              No sales data available yet
            </div>
          )}
        </Card>
        <ChartCard title="Payment methods" subtitle="Share of transactions this week">
          {loading ? <Skeleton className="size-full" /> : <div className="flex h-full items-center justify-center text-muted-foreground">No payment data yet</div>}
        </ChartCard>
      </div>

      {/* Recent sales + top selling products */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between px-5 pb-1 pt-5">
            <div>
              <h3 className="text-[15px] font-semibold tracking-tight">Recent sales</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Latest transactions across your tills</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/sales">
                <Eye /> View all
              </Link>
            </Button>
          </div>
          <DataTable
            className="border-0 shadow-none"
            borderless
            columns={columns}
            data={sales.slice(0, 6)}
            rowKey={(r) => r.id}
            loading={loading || isLoading}
            pageSize={6}
            searchable={false}
            emptyTitle="No sales yet"
            emptyDescription="Sales from your tills will appear here."
            emptyAction={
              <Button asChild>
                <Link href="/pos">Start selling</Link>
              </Button>
            }
            mobileCard={(r) => (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{r.orderNo}</span>
                  <span className="font-semibold tabular-nums">{formatKES(r.total)}</span>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{r.customerName}</span>
                  <PaymentBadge method={r.paymentMethod} />
                </div>
                <StatusPill sale={r} />
              </div>
            )}
            onRowClick={(r) => router.push(`/sales?order=${r.id}`)}
          />
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold tracking-tight">Top selling products</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">By revenue, all time</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/reports">Reports</Link>
            </Button>
          </div>
          {loading || isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No product data available yet
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-3">
                  <ProductThumb category={product.category} className="size-8 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">{product.name}</p>
                    <p className="text-[11px] text-muted-foreground">{product.sold} sold</p>
                  </div>
                  <span className="text-[13px] font-semibold tabular-nums">
                    {formatKES(product.sold * product.price)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick actions */}
      <QuickActions />
    </div>
  );
}

function StatusPill({ sale }: { sale: Sale }) {
  const map: Record<string, string> = {
    completed: "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
    pending: "bg-amber-50 text-amber-800 ring-amber-200/60",
    refunded: "bg-red-50 text-red-700 ring-red-200/60",
    partially_refunded: "bg-violet-50 text-violet-700 ring-violet-200/60",
  };
  const labels: Record<string, string> = {
    completed: "Completed",
    pending: "Pending",
    refunded: "Refunded",
    partially_refunded: "Partial refund",
  };
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 " +
        map[sale.status]
      }
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {labels[sale.status]}
    </span>
  );
}

"use client";

import * as React from "react";
import { useRef } from "react";

import {
  AlertTriangle,
  Banknote,
  Download,
  FileSpreadsheet,
  Printer,
  ReceiptText,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { ChartCard } from "@/components/shared/ChartCard";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { DonutChart } from "@/components/charts/DonutChart";
import { SalesAreaChart, type TrendRange } from "@/components/charts/SalesAreaChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductThumb } from "@/components/shared/ProductThumb";
import { RoleBadge } from "@/components/shared/StatusBadge";
import {
  compactKES,
  downloadCSV,
  formatKES,
  formatNumber,
} from "@/lib/utils";
import { useSimulatedLoading } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/misc";
import { getSales, subscribeToSales, unsubscribeFromSales } from "@/lib/api/sales";
import { getProducts, subscribeToProducts, unsubscribeFromProducts } from "@/lib/api/products";
import { getExpenses, subscribeToExpenses, unsubscribeFromExpenses } from "@/lib/api/expenses";
import { getEmployees, subscribeToEmployees, unsubscribeFromEmployees } from "@/lib/api/employees";
import type { PnlMonth } from "@/types";

export default function ReportsPage() {
  const loading = useSimulatedLoading(500);
  const [range, setRange] = React.useState<TrendRange>("month");
  const [sales, setSales] = React.useState<any[]>([]);
  const [products, setProducts] = React.useState<any[]>([]);
  const [expenses, setExpenses] = React.useState<any[]>([]);
  const [employees, setEmployees] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const salesSubscriptionRef = React.useRef<any>(null);
  const productsSubscriptionRef = React.useRef<any>(null);
  const expensesSubscriptionRef = React.useRef<any>(null);
  const employeesSubscriptionRef = React.useRef<any>(null);

  // Fetch data on mount
  React.useEffect(() => {
    async function fetchReportData() {
      try {
        const [salesData, productsData, expensesData, employeesData] = await Promise.all([
          getSales(),
          getProducts(),
          getExpenses(),
          getEmployees()
        ]);
        setSales(salesData);
        setProducts(productsData);
        setExpenses(expensesData);
        setEmployees(employeesData);
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReportData();

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

    if (!expensesSubscriptionRef.current) {
      const expensesChannel = subscribeToExpenses((updatedExpenses) => {
        setExpenses(updatedExpenses);
      });
      expensesSubscriptionRef.current = expensesChannel;
    }

    if (!employeesSubscriptionRef.current) {
      const employeesChannel = subscribeToEmployees((updatedEmployees) => {
        setEmployees(updatedEmployees);
      });
      employeesSubscriptionRef.current = employeesChannel;
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
      if (expensesSubscriptionRef.current) {
        unsubscribeFromExpenses(expensesSubscriptionRef.current);
        expensesSubscriptionRef.current = null;
      }
      if (employeesSubscriptionRef.current) {
        unsubscribeFromEmployees(employeesSubscriptionRef.current);
        employeesSubscriptionRef.current = null;
      }
    };
  }, []);

  const topProducts = React.useMemo(() => {
    return products
      .filter(p => p.status === "active")
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  }, [products]);

  const expenseBreakdown = React.useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });
    return Object.entries(categoryTotals).map(([category, amount]) => ({ category, amount }));
  }, [expenses]);

  const expensesMonthly = React.useMemo(() => {
    const monthlyTotals: Record<string, number> = {};
    expenses.forEach(exp => {
      const month = new Date(exp.date).toISOString().slice(0, 7);
      monthlyTotals[month] = (monthlyTotals[month] || 0) + exp.amount;
    });
    return Object.entries(monthlyTotals).map(([month, amount]) => ({ month, amount }));
  }, [expenses]);

  const cashierPerformance = React.useMemo(() => {
    const cashierStats: Record<string, { name: string; orders: number; sales: number; refunds: number }> = {};
    sales.forEach(sale => {
      if (!cashierStats[sale.cashier]) {
        cashierStats[sale.cashier] = { name: sale.cashier, orders: 0, sales: 0, refunds: 0 };
      }
      cashierStats[sale.cashier].orders += 1;
      cashierStats[sale.cashier].sales += sale.total;
      if (sale.status === "refunded") {
        cashierStats[sale.cashier].refunds += 1;
      }
    });
    return Object.values(cashierStats).map(c => ({
      ...c,
      avgOrder: c.orders > 0 ? c.sales / c.orders : 0,
      role: "Cashier" // Simplified - would need to be fetched from employee data
    }));
  }, [sales]);

  function exportReport(kind: string) {
    const totalSales = sales.reduce((a, s) => a + s.total, 0);
    const totalOrders = sales.length;
    const avgOrder = totalOrders > 0 ? totalSales / totalOrders : 0;
    const refunds = sales.filter(s => s.status === "refunded").reduce((a, s) => a + s.total, 0);
    const netSales = totalSales - refunds;

    downloadCSV(`zimora-${kind}-report.csv`, [
      ["Metric", "Value"],
      ["Total sales (KES)", String(totalSales)],
      ["Total orders", String(totalOrders)],
      ["Average order value (KES)", String(avgOrder)],
      ["Refunds (KES)", String(refunds)],
      ["Net sales (KES)", String(netSales)],
    ]);
    toast.success("Export started", { description: `zimora-${kind}-report.csv downloaded.` });
  }

  const pnlColumns: ColumnDef<PnlMonth>[] = [
    { id: "month", header: "Month", accessor: (r) => r.month, sortable: true, cell: (r) => <span className="font-medium">{r.month}</span> },
    {
      id: "revenue",
      header: "Revenue",
      accessor: (r) => r.revenue,
      align: "right",
      sortable: true,
      cell: (r) => <span className="tabular-nums">{formatKES(r.revenue)}</span>,
    },
    {
      id: "cogs",
      header: "Cost of goods",
      accessor: (r) => r.cogs,
      align: "right",
      hideBelow: "md",
      cell: (r) => <span className="tabular-nums text-muted-foreground">{formatKES(r.cogs)}</span>,
    },
    {
      id: "gross",
      header: "Gross profit",
      accessor: (r) => r.revenue - r.cogs,
      align: "right",
      sortable: true,
      cell: (r) => <span className="font-medium tabular-nums">{formatKES(r.revenue - r.cogs)}</span>,
    },
    {
      id: "expenses",
      header: "Expenses",
      accessor: (r) => r.expenses,
      align: "right",
      hideBelow: "md",
      cell: (r) => <span className="tabular-nums text-muted-foreground">{formatKES(r.expenses)}</span>,
    },
    {
      id: "net",
      header: "Net profit",
      accessor: (r) => r.revenue - r.cogs - r.expenses,
      align: "right",
      sortable: true,
      cell: (r) => (
        <span className="font-semibold tabular-nums text-primary">{formatKES(r.revenue - r.cogs - r.expenses)}</span>
      ),
    },
  ];

  return (
    <div className="page space-y-5">
      <PageHeader
        title="Reports"
        description="Business analytics across sales, products and profitability"
        actions={
          <>
            <Button variant="outline" onClick={() => exportReport("sales")}>
              <Download /> Export CSV
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Printer /> Export &amp; Print
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => toast.success("Preparing PDF report…")}>
                  <FileSpreadsheet /> Export PDF
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => window.print()}>
                  <Printer /> Print report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      <Tabs defaultValue="sales">
        <TabsList variant="underline">
          <TabsTrigger variant="underline" value="sales">Sales</TabsTrigger>
          <TabsTrigger variant="underline" value="products">Products</TabsTrigger>
          <TabsTrigger variant="underline" value="inventory">Inventory</TabsTrigger>
          <TabsTrigger variant="underline" value="pnl">Profit &amp; Loss</TabsTrigger>
          <TabsTrigger variant="underline" value="expenses">Expenses</TabsTrigger>
          <TabsTrigger variant="underline" value="employees">Employees</TabsTrigger>
        </TabsList>

        {/* ── Sales report ─────────────────────────────────────── */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard loading={loading || isLoading} label="Total Sales" value={formatKES(sales.reduce((a, s) => a + s.total, 0))} icon={Banknote} />
            <MetricCard loading={loading || isLoading} label="Total Orders" value={String(sales.length)} icon={ReceiptText} iconTone="info" />
            <MetricCard loading={loading || isLoading} label="Avg Order Value" value={formatKES(sales.length > 0 ? sales.reduce((a, s) => a + s.total, 0) / sales.length : 0)} icon={TrendingUp} iconTone="primary" />
            <MetricCard loading={loading || isLoading} label="Refunds" value={formatKES(sales.filter(s => s.status === "refunded").reduce((a, s) => a + s.total, 0))} icon={ReceiptText} iconTone="destructive" />
            <MetricCard loading={loading || isLoading} label="Net Sales" value={formatKES(sales.reduce((a, s) => a + s.total, 0) - sales.filter(s => s.status === "refunded").reduce((a, s) => a + s.total, 0))} icon={Wallet} iconTone="default" />
          </div>

          <Card className="p-5">
            <h3 className="text-[15px] font-semibold tracking-tight">Sales &amp; orders trend</h3>
            {loading ? (
              <Skeleton className="mt-4 h-[300px] w-full" />
            ) : (
              <div className="mt-4 flex h-[300px] items-center justify-center text-muted-foreground">
                No sales data available yet
              </div>
            )}
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Payment method distribution" subtitle="Last 12 months">
              {loading ? <Skeleton className="size-full" /> : <div className="flex h-full items-center justify-center text-muted-foreground">No payment data yet</div>}
            </ChartCard>
            <ChartCard title="Sales by category" subtitle="Share of revenue">
              {loading ? <Skeleton className="size-full" /> : <div className="flex h-full items-center justify-center text-muted-foreground">No category data yet</div>}
            </ChartCard>
          </div>
        </TabsContent>

        {/* ── Product performance ──────────────────────────────── */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            {topProducts.length === 0 ? "No product data available yet" : `${topProducts.length} products found`}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Top 5 by revenue" subtitle="All-time revenue leaders">
              {loading || isLoading ? (
                <Skeleton className="size-full" />
              ) : topProducts.length === 0 ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">No revenue data yet</div>
              ) : (
                <div className="space-y-2">
                  {topProducts.map((product, i) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <span className="text-sm">{product.name}</span>
                      <span className="font-semibold">{formatKES(product.sold * product.price)}</span>
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>
            <Card className="p-5">
              <h3 className="text-[15px] font-semibold tracking-tight">Slow-moving stock</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Consider promos or markdowns to free up cash</p>
              <div className="mt-4 flex h-[200px] items-center justify-center text-muted-foreground">
                {products.filter(p => p.status === "active" && p.sold === 0).length === 0 ? "No slow-moving data yet" : `${products.filter(p => p.status === "active" && p.sold === 0).length} products with no sales`}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ── Inventory report ─────────────────────────────────── */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard loading={loading || isLoading} label="Stock Value (cost)" value={formatKES(products.filter(p => p.status === "active").reduce((a, p) => a + p.stock * p.cost, 0))} icon={Wallet} />
            <MetricCard loading={loading || isLoading} label="Stock Value (retail)" value={formatKES(products.filter(p => p.status === "active").reduce((a, p) => a + p.stock * p.price, 0))} icon={Banknote} iconTone="info" />
            <MetricCard loading={loading || isLoading} label="Low Stock" value={String(products.filter(p => p.status === "active" && p.stock <= p.minStock).length)} icon={AlertTriangle} iconTone="warning" />
            <MetricCard loading={loading || isLoading} label="Out of Stock" value={String(products.filter(p => p.status === "active" && p.stock === 0).length)} icon={AlertTriangle} iconTone="destructive" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Stock value by category" subtitle="At cost price">
              {loading || isLoading ? (
                <Skeleton className="size-full" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">Stock data available</div>
              )}
            </ChartCard>
            <Card className="p-5">
              <h3 className="text-[15px] font-semibold tracking-tight">Reorder soon</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Products at or below minimum stock</p>
              <div className="mt-4 flex h-[200px] items-center justify-center text-muted-foreground">
                {products.filter(p => p.status === "active" && p.stock <= p.minStock).length === 0 ? "No reorder data yet" : `${products.filter(p => p.status === "active" && p.stock <= p.minStock).length} products need reordering`}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ── Profit & Loss ────────────────────────────────────── */}
        <TabsContent value="pnl" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard loading={loading || isLoading} label="Revenue" value={formatKES(sales.reduce((a: number, s: any) => a + s.total, 0))} icon={Banknote} />
            <MetricCard loading={loading || isLoading} label="Cost of Goods" value={formatKES(sales.reduce((a: number, s: any) => a + s.items.reduce((sum: number, item: any) => sum + (item.cost || 0) * item.qty, 0), 0))} icon={Wallet} iconTone="default" />
            <MetricCard
              loading={loading || isLoading}
              label="Gross Profit"
              value={formatKES(sales.reduce((a: number, s: any) => a + s.total, 0) - sales.reduce((a: number, s: any) => a + s.items.reduce((sum: number, item: any) => sum + (item.cost || 0) * item.qty, 0), 0))}
              icon={TrendingUp}
              iconTone="primary"
            />
            <MetricCard loading={loading || isLoading} label="Expenses" value={formatKES(expenses.reduce((a: number, e: any) => a + e.amount, 0))} icon={Wallet} iconTone="destructive" />
            <MetricCard
              loading={loading || isLoading}
              label="Net Profit"
              value={formatKES(sales.reduce((a: number, s: any) => a + s.total, 0) - sales.reduce((a: number, s: any) => a + s.items.reduce((sum: number, item: any) => sum + (item.cost || 0) * item.qty, 0), 0) - expenses.reduce((a: number, e: any) => a + e.amount, 0))}
              icon={TrendingUp}
              iconTone="primary"
            />
          </div>

          <ChartCard title="Revenue vs costs" subtitle="Rolling 12 months" height="h-64">
            {loading || isLoading ? (
              <Skeleton className="size-full" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">P&L data available</div>
            )}
          </ChartCard>

          <DataTable
            columns={pnlColumns}
            data={[]}
            rowKey={(r) => r.month}
            loading={loading || isLoading}
            searchable={false}
            pageSize={12}
            emptyTitle="No P&L data"
          />
        </TabsContent>

        {/* ── Expenses report ──────────────────────────────────── */}
        <TabsContent value="expenses" className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Expense breakdown" subtitle="Share of operating spend">
            {loading || isLoading ? <Skeleton className="size-full" /> : expenseBreakdown.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">No expense data yet</div>
            ) : (
              <div className="space-y-2">
                {expenseBreakdown.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">{item.category}</span>
                    <span className="font-semibold">{formatKES(item.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
          <ChartCard title="Monthly expenses" subtitle="Last 6 months">
            {loading || isLoading ? <Skeleton className="size-full" /> : expensesMonthly.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">No expense data yet</div>
            ) : (
              <div className="space-y-2">
                {expensesMonthly.slice(-6).map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">{item.month}</span>
                    <span className="font-semibold">{formatKES(item.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </TabsContent>

        {/* ── Employees report ─────────────────────────────────── */}
        <TabsContent value="employees" className="space-y-4">
          <DataTable
            columns={[
              {
                id: "cashier",
                header: "Cashier",
                accessor: (r) => r.name,
                sortable: true,
                cell: (r) => (
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[11px] font-semibold text-teal-800">
                      {r.name.split(" ").map((n: string) => n[0]).join("")}
                    </span>
                    <div>
                      <p className="font-medium">{r.name}</p>
                      <RoleBadge role={r.role} />
                    </div>
                  </div>
                ),
              },
              { id: "orders", header: "Orders", accessor: (r) => r.orders, align: "right", sortable: true, cell: (r) => <span className="tabular-nums">{r.orders}</span> },
              { id: "sales", header: "Sales", accessor: (r) => r.sales, align: "right", sortable: true, cell: (r) => <span className="font-semibold tabular-nums">{formatKES(r.sales)}</span> },
              { id: "avg", header: "Avg order", accessor: (r) => r.avgOrder, align: "right", sortable: true, hideBelow: "md", cell: (r) => <span className="tabular-nums">{formatKES(r.avgOrder)}</span> },
              { id: "refunds", header: "Refunds", accessor: (r) => r.refunds, align: "right", sortable: true, hideBelow: "md", cell: (r) => <span className="tabular-nums">{r.refunds}</span> },
            ]}
            data={cashierPerformance}
            rowKey={(r) => r.name}
            loading={loading || isLoading}
            searchable={false}
            pageSize={8}
            defaultSort={{ id: "sales", dir: "desc" }}
            emptyTitle="No staff activity yet"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

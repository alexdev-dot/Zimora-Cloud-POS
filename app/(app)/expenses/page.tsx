"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useRef } from "react";
import {
  CalendarDays,
  Download,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Plus,
  Trash2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { PaymentBadge } from "@/components/shared/StatusBadge";
import { ChartCard } from "@/components/shared/ChartCard";
import { Avatar } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormField, Input, NativeSelect, Textarea } from "@/components/ui/input";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { downloadCSV, formatKES, formatDate, uid } from "@/lib/utils";
import { useSimulatedLoading } from "@/lib/hooks";
import { getExpenses, createExpense, updateExpense, deleteExpense, subscribeToExpenses, unsubscribeFromExpenses } from "@/lib/api/expenses";
import type { Expense } from "@/types";

export default function ExpensesPage() {
  return (
    <React.Suspense fallback={null}>
      <ExpensesInner />
    </React.Suspense>
  );
}

function ExpensesInner() {
  const params = useSearchParams();
  const loading = useSimulatedLoading(450);
  const [rows, setRows] = React.useState<Expense[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Expense | null>(null);
  const subscriptionRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (params.get("new")) setFormOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch expenses on mount
  React.useEffect(() => {
    async function fetchExpenses() {
      try {
        const data = await getExpenses();
        setRows(data);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchExpenses();

    // Set up real-time subscription (separate from data fetch to avoid duplicate subscriptions)
    if (!subscriptionRef.current) {
      const channel = subscribeToExpenses((updatedExpenses) => {
        setRows(updatedExpenses);
      });
      subscriptionRef.current = channel;
    }

    // Cleanup subscription on unmount
    return () => {
      if (subscriptionRef.current) {
        unsubscribeFromExpenses(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, []);

  const filtered = React.useMemo(
    () => rows.filter((r) => categoryFilter === "all" || r.category === categoryFilter),
    [rows, categoryFilter]
  );

  const stats = React.useMemo(() => {
    const now = Date.now();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const monthStart = new Date(now - 30 * 86400000).getTime();
    const total = rows.reduce((a, r) => a + r.amount, 0);
    const today = rows.filter((r) => new Date(r.date).getTime() >= todayStart);
    const month = rows.filter((r) => new Date(r.date).getTime() >= monthStart);
    const largest = [...rows].sort((a, b) => b.amount - a.amount)[0];
    return {
      total,
      today: today.reduce((a, r) => a + r.amount, 0),
      todayCount: today.length,
      month: month.reduce((a, r) => a + r.amount, 0),
      largest,
    };
  }, [rows]);

  function exportCsv() {
    downloadCSV("zimora-expenses.csv", [
      ["Expense", "Category", "Amount (KES)", "Date", "Added by", "Payment method", "Notes"],
      ...filtered.map((r) => [
        r.name,
        r.category,
        r.amount,
        new Date(r.date).toISOString(),
        r.addedBy,
        r.paymentMethod,
        r.notes ?? "",
      ]),
    ]);
    toast.success("Export started", { description: "zimora-expenses.csv downloaded." });
  }

  const columns: ColumnDef<Expense>[] = [
    {
      id: "expense",
      header: "Expense",
      accessor: (r) => r.name,
      sortable: true,
      cell: (r) => (
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <Wallet className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="max-w-[230px] truncate font-medium">{r.name}</p>
            {r.notes && <p className="max-w-[230px] truncate text-xs text-muted-foreground">{r.notes}</p>}
          </div>
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      accessor: (r) => r.category,
      sortable: true,
      cell: (r) => <Badge variant="outline">{r.category}</Badge>,
    },
    {
      id: "amount",
      header: "Amount",
      accessor: (r) => r.amount,
      align: "right",
      sortable: true,
      cell: (r) => <span className="font-semibold tabular-nums">{formatKES(r.amount)}</span>,
    },
    {
      id: "date",
      header: "Date",
      accessor: (r) => r.date,
      sortable: true,
      cell: (r) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(r.date)}</span>,
    },
    {
      id: "added",
      header: "Added by",
      accessor: (r) => r.addedBy,
      hideBelow: "lg",
      cell: (r) => (
        <span className="flex items-center gap-2">
          <Avatar name={r.addedBy} size={6} />
          <span className="max-w-[120px] truncate">{r.addedBy}</span>
        </span>
      ),
    },
    {
      id: "method",
      header: "Paid via",
      accessor: (r) => r.paymentMethod,
      hideBelow: "md",
      cell: (r) =>
        r.paymentMethod === "bank" ? (
          <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">Bank transfer</span>
        ) : (
          <PaymentBadge method={r.paymentMethod} />
        ),
    },
  ];

  return (
    <div className="page space-y-5">
      <PageHeader
        title="Expenses"
        description="Operating costs and day-to-day spending"
        actions={
          <>
            <Button variant="outline" onClick={exportCsv}>
              <Download /> Export
            </Button>
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus /> Add Expense
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard loading={loading} label="Total Expenses" value={formatKES(stats.total)} icon={Wallet} />
        <MetricCard
          loading={loading}
          label="Last 30 Days"
          value={formatKES(stats.month)}
          icon={CalendarDays}
          iconTone="info"
        />
        <MetricCard
          loading={loading}
          label="Today"
          value={formatKES(stats.today)}
          icon={CalendarDays}
          iconTone="warning"
          footer={<p className="text-xs text-muted-foreground">{stats.todayCount} entries today</p>}
        />
        <MetricCard
          loading={loading}
          label="Largest Expense"
          value={stats.largest ? formatKES(stats.largest.amount) : "—"}
          icon={Wallet}
          iconTone="destructive"
          footer={stats.largest && <p className="max-w-[180px] truncate text-xs text-muted-foreground">{stats.largest.name}</p>}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <DataTable
            columns={columns}
            data={filtered}
            rowKey={(r) => r.id}
            loading={loading || isLoading}
            searchable="Search expenses…"
            pageSize={8}
            defaultSort={{ id: "date", dir: "desc" }}
            emptyIcon={Wallet}
            emptyTitle="No expenses recorded"
            emptyDescription="Track rent, salaries and day-to-day costs to see true profitability."
            emptyAction={
              <Button
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <Plus /> Add Expense
              </Button>
            }
            filters={
              <NativeSelect
                aria-label="Category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-[150px]"
              >
                <option value="all">All categories</option>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
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
                  <DropdownMenuItem
                    onSelect={() => {
                      setEditing(r);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem destructive onSelect={() => setDeleteTarget(r)}>
                    <Trash2 /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            mobileCard={(r) => (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13.5px] font-medium">{r.name}</span>
                  <span className="font-semibold tabular-nums">{formatKES(r.amount)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <Badge variant="outline">{r.category}</Badge>
                  <span className="text-muted-foreground">{formatDate(r.date)}</span>
                </div>
              </div>
            )}
            footer={
              <span className="flex items-center justify-between">
                <span>{filtered.length} expenses</span>
                <strong className="text-foreground tabular-nums">
                  {formatKES(filtered.reduce((a, r) => a + r.amount, 0))}
                </strong>
              </span>
            }
          />
        </div>

        <div className="space-y-4">
          <ChartCard title="Where money goes" subtitle="Share of operating spend">
            {loading ? (
              <div className="h-52 animate-pulse rounded-lg bg-slate-200/60" />
            ) : (
              <div className="flex h-52 items-center justify-center text-muted-foreground">
                No expense data available yet
              </div>
            )}
          </ChartCard>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="text-[15px] font-semibold tracking-tight">Receipts</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Attach receipts when recording expenses for clean bookkeeping at tax time.
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-input bg-muted/30 px-3.5 py-3 text-[13px] text-muted-foreground">
              <Paperclip className="size-4" /> Attachments supported in the expense form
            </div>
          </div>
        </div>
      </div>

      <ExpenseFormDialog
        open={formOpen}
        expense={editing}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) setEditing(null);
        }}
        onSave={async (x) => {
          try {
            if (editing) {
              await updateExpense(x.id, x);
            } else {
              await createExpense(x);
            }
            // Refresh list
            const updated = await getExpenses();
            setRows(updated);
            setFormOpen(false);
            setEditing(null);
            toast.success(editing ? "Expense updated" : "Expense recorded", { description: `${x.name} · ${formatKES(x.amount)}` });
          } catch (error) {
            console.error('Failed to save expense:', error);
            toast.error('Failed to save expense');
          }
        }}
      />

      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete expense?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" (${formatKES(deleteTarget.amount)}) will be permanently removed from your records.`
            : ""
        }
        confirmLabel="Delete expense"
        destructive
        onConfirm={async () => {
          if (deleteTarget) {
            try {
              await deleteExpense(deleteTarget.id);
              // Refresh list
              const updated = await getExpenses();
              setRows(updated);
              setDeleteTarget(null);
              toast.success("Expense deleted");
            } catch (error) {
              console.error('Failed to delete expense:', error);
              toast.error('Failed to delete expense');
            }
          }
        }}
      />
    </div>
  );
}

function ExpenseFormDialog({
  open,
  expense,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  expense: Expense | null;
  onOpenChange: (o: boolean) => void;
  onSave: (e: Expense) => void;
}) {
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState<string>("Supplies");
  const [amount, setAmount] = React.useState("");
  const [date, setDate] = React.useState("");
  const [method, setMethod] = React.useState<Expense["paymentMethod"]>("cash");
  const [notes, setNotes] = React.useState("");
  const [errors, setErrors] = React.useState<{ name?: string; amount?: string }>({});

  React.useEffect(() => {
    if (open) {
      setName(expense?.name ?? "");
      setCategory(expense?.category ?? "Supplies");
      setAmount(expense ? String(expense.amount) : "");
      setDate(expense ? new Date(expense.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
      setMethod(expense?.paymentMethod ?? "cash");
      setNotes(expense?.notes ?? "");
      setErrors({});
    }
  }, [open, expense]);

  function save() {
    const e: { name?: string; amount?: string } = {};
    if (!name.trim()) e.name = "Expense name is required";
    if (!amount || parseFloat(amount) <= 0) e.amount = "Enter a valid amount";
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({
      id: expense?.id ?? uid("x"),
      name: name.trim(),
      category,
      amount: Math.round(parseFloat(amount)),
      date: date ? new Date(date + "T12:00:00").toISOString() : new Date().toISOString(),
      addedBy: expense?.addedBy ?? "Current User",
      paymentMethod: method,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>{expense ? "Edit expense" : "Add expense"}</DialogTitle>
          <DialogDescription>Record an operating cost</DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-3.5">
          <FormField label="Expense name" htmlFor="ex-name" required error={errors.name}>
            <Input
              id="ex-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kenya Power Bill — September"
              aria-invalid={Boolean(errors.name)}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Category" htmlFor="ex-category">
              <NativeSelect id="ex-category" value={category} onChange={(e) => setCategory(e.target.value)}>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </NativeSelect>
            </FormField>
            <FormField label="Amount (KSh)" htmlFor="ex-amount" required error={errors.amount}>
              <Input
                id="ex-amount"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0"
                aria-invalid={Boolean(errors.amount)}
                className="tabular-nums"
              />
            </FormField>
            <FormField label="Date" htmlFor="ex-date">
              <Input id="ex-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </FormField>
            <FormField label="Payment method" htmlFor="ex-method">
              <NativeSelect
                id="ex-method"
                value={method}
                onChange={(e) => setMethod(e.target.value as Expense["paymentMethod"])}
              >
                <option value="cash">Cash</option>
                <option value="mpesa">M-Pesa</option>
                <option value="card">Card</option>
                <option value="bank">Bank transfer</option>
              </NativeSelect>
            </FormField>
          </div>
          <FormField label="Description" htmlFor="ex-notes" hint="Optional context for your accountant">
            <Textarea id="ex-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Paid to KPLC account 4412-88" />
          </FormField>
          <div>
            <span className="mb-1.5 block text-[13px] font-medium">Receipt attachment</span>
            <button
              type="button"
              onClick={() => toast.info("File upload", { description: "Connect storage (e.g. Supabase) to enable attachments." })}
              className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-muted/30 px-4 py-4 text-[13px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <Paperclip className="size-4" /> Attach a photo or PDF receipt
            </button>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>{expense ? "Save changes" : "Save expense"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Crown,
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Shield,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/misc";
import { cn, formatKES, formatDate } from "@/lib/utils";
import { useSimulatedLoading } from "@/lib/hooks";

// Mock subscription data - replace with actual API calls
const mockSubscriptions = [
  {
    id: "SUB-001",
    tenantId: "1",
    tenantName: "ABC Supermarket",
    plan: "professional",
    status: "active",
    billingCycle: "monthly",
    amount: 4999,
    nextBilling: "2024-10-15T00:00:00Z",
    startDate: "2024-01-15T00:00:00Z",
    users: 12,
    maxUsers: 30,
    paymentMethod: "mpesa",
    autoRenew: true,
  },
  {
    id: "SUB-002",
    tenantId: "2",
    tenantName: "XYZ Electronics",
    plan: "enterprise",
    status: "active",
    billingCycle: "yearly",
    amount: 120000,
    nextBilling: "2025-02-20T00:00:00Z",
    startDate: "2024-02-20T00:00:00Z",
    users: 45,
    maxUsers: 100,
    paymentMethod: "card",
    autoRenew: true,
  },
  {
    id: "SUB-003",
    tenantId: "3",
    tenantName: "Quick Mart",
    plan: "starter",
    status: "trial",
    billingCycle: "monthly",
    amount: 2500,
    nextBilling: "2024-10-01T00:00:00Z",
    startDate: "2024-09-01T00:00:00Z",
    users: 3,
    maxUsers: 2,
    paymentMethod: "mpesa",
    autoRenew: false,
  },
  {
    id: "SUB-004",
    tenantId: "4",
    tenantName: "Fresh Foods Ltd",
    plan: "professional",
    status: "past_due",
    billingCycle: "monthly",
    amount: 4999,
    nextBilling: "2024-09-15T00:00:00Z",
    startDate: "2023-11-10T00:00:00Z",
    users: 8,
    maxUsers: 30,
    paymentMethod: "mpesa",
    autoRenew: true,
  },
  {
    id: "SUB-005",
    tenantId: "5",
    tenantName: "Tech Hub",
    plan: "professional",
    status: "active",
    billingCycle: "monthly",
    amount: 4999,
    nextBilling: "2024-10-05T00:00:00Z",
    startDate: "2024-03-05T00:00:00Z",
    users: 15,
    maxUsers: 30,
    paymentMethod: "card",
    autoRenew: true,
  },
];

type Subscription = typeof mockSubscriptions[0];

// Plan features for comparison
const planFeatures = [
  { feature: "Basic POS", starter: true, professional: true, enterprise: true },
  { feature: "Product Management", starter: true, professional: true, enterprise: true },
  { feature: "Basic Inventory", starter: true, professional: true, enterprise: true },
  { feature: "Sales Reports", starter: true, professional: true, enterprise: true },
  { feature: "Email Support", starter: true, professional: true, enterprise: true },
  { feature: "Multi-location", starter: false, professional: true, enterprise: true },
  { feature: "Advanced Analytics", starter: false, professional: true, enterprise: true },
  { feature: "Staff Roles & Permissions", starter: false, professional: true, enterprise: true },
  { feature: "Priority Support", starter: false, professional: true, enterprise: true },
  { feature: "API Access", starter: false, professional: false, enterprise: true },
  { feature: "Custom Integrations", starter: false, professional: false, enterprise: true },
  { feature: "Dedicated Account Manager", starter: false, professional: false, enterprise: true },
];

export default function SubscriptionsPage() {
  const loading = useSimulatedLoading(450);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [planFilter, setPlanFilter] = React.useState("all");

  const filteredSubscriptions = React.useMemo(() => {
    return mockSubscriptions.filter((sub) => {
      const matchesSearch = sub.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sub.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
      const matchesPlan = planFilter === "all" || sub.plan === planFilter;
      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [searchQuery, statusFilter, planFilter]);

  const columns: ColumnDef<Subscription>[] = [
    {
      id: "tenant",
      header: "Tenant",
      accessor: (r) => r.tenantName,
      sortable: true,
      cell: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.tenantName} size={8} />
          <div>
            <p className="font-medium">{r.tenantName}</p>
            <p className="text-xs text-muted-foreground">{r.id}</p>
          </div>
        </div>
      ),
    },
    {
      id: "plan",
      header: "Plan",
      accessor: (r) => r.plan,
      cell: (r) => <PlanBadge plan={r.plan} />,
    },
    {
      id: "status",
      header: "Status",
      accessor: (r) => r.status,
      cell: (r) => <SubscriptionStatusBadge status={r.status} />,
    },
    {
      id: "billing",
      header: "Billing",
      accessor: (r) => `${r.billingCycle}/${formatKES(r.amount)}`,
      cell: (r) => (
        <div>
          <p className="font-medium capitalize">{r.billingCycle}</p>
          <p className="text-xs text-muted-foreground">{formatKES(r.amount)}</p>
        </div>
      ),
    },
    {
      id: "nextBilling",
      header: "Next Billing",
      accessor: (r) => r.nextBilling,
      cell: (r) => (
        <div className="flex items-center gap-2">
          <Calendar className="size-3.5 text-muted-foreground" />
          <span className="text-sm">{formatDate(r.nextBilling, true)}</span>
        </div>
      ),
    },
    {
      id: "users",
      header: "Users",
      accessor: (r) => `${r.users}/${r.maxUsers}`,
      align: "right",
      cell: (r) => (
        <div className="flex items-center gap-1 justify-end">
          <Users className="size-3.5 text-muted-foreground" />
          <span className="font-medium tabular-nums">{r.users}/{r.maxUsers}</span>
        </div>
      ),
    },
    {
      id: "autoRenew",
      header: "Auto-Renew",
      cell: (r) => (
        <span className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
          r.autoRenew ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
        )}>
          {r.autoRenew ? <RefreshCw className="size-3" /> : <XCircle className="size-3" />}
          {r.autoRenew ? "Enabled" : "Disabled"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: (r) => <SubscriptionActions subscription={r} />,
    },
  ];

  const handleExport = (format: string) => {
    toast.success(`Export started`, {
      description: `Your ${format} report will download shortly`,
    });
  };

  const handleCreateSubscription = () => {
    toast.info("Create subscription", {
      description: "Subscription creation form will open in a modal",
    });
  };

  return (
    <div className="page space-y-5">
      <PageHeader
        title="Subscriptions"
        description="Manage all tenant subscriptions, billing, and plan upgrades"
        actions={
          <>
            <Button onClick={handleCreateSubscription}>
              <Plus /> Create Subscription
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => handleExport("CSV")}>
                  <FileText /> Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleExport("PDF")}>
                  <FileText /> Export PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      {/* KPI cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <MetricCard
          loading={loading}
          label="Total Revenue"
          value="KSh 4.2M"
          icon={CreditCard}
          iconTone="primary"
          change={{ value: 15.3, caption: "vs last month", goodWhenUp: true }}
        />
        <MetricCard
          loading={loading}
          label="Active Subscriptions"
          value="1,180"
          icon={CheckCircle2}
          iconTone="primary"
          change={{ value: 8.2, caption: "vs last month", goodWhenUp: true }}
        />
        <MetricCard
          loading={loading}
          label="Past Due"
          value="22"
          icon={AlertTriangle}
          iconTone="warning"
          change={{ value: -5, caption: "vs last week", goodWhenUp: true }}
        />
        <MetricCard
          loading={loading}
          label="Trial Conversions"
          value="67%"
          icon={TrendingUp}
          iconTone="info"
          change={{ value: 12.5, caption: "vs last month", goodWhenUp: true }}
        />
      </div>

      {/* Plan Overview Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <PlanCard
          name="Starter"
          price="KSh 2,500"
          period="/month"
          description="Basic POS for small businesses"
          icon={Zap}
          iconColor="text-slate-600"
          bgColor="bg-slate-50"
          borderColor="border-slate-200"
          features={planFeatures.filter(f => f.starter)}
          tenants={320}
          revenue="KSh 800K"
        />
        <PlanCard
          name="Professional"
          price="KSh 4,999"
          period="/month"
          description="Professional plan with advanced features"
          icon={Crown}
          iconColor="text-primary"
          bgColor="bg-primary/5"
          borderColor="border-primary/30"
          features={planFeatures.filter(f => f.professional)}
          tenants={680}
          revenue="KSh 3.4M"
          popular
        />
        <PlanCard
          name="Enterprise"
          price="KSh 120,000"
          period="/year"
          description="One-time payment for large businesses"
          icon={Shield}
          iconColor="text-navy"
          bgColor="bg-navy/5"
          borderColor="border-navy/30"
          features={planFeatures.filter(f => f.enterprise)}
          tenants={247}
          revenue="KSh 29.6M"
        />
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by tenant name or subscription ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <NativeSelect
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="past_due">Past Due</option>
              <option value="cancelled">Cancelled</option>
            </NativeSelect>
            <NativeSelect
              aria-label="Filter by plan"
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="w-[140px]"
            >
              <option value="all">All Plans</option>
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </NativeSelect>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{filteredSubscriptions.length} subscriptions</span>
            <span>•</span>
            <Link href="/admin/tenants" className="text-primary hover:underline">
              Manage tenants
            </Link>
          </div>
        </div>
      </Card>

      {/* Subscriptions Table */}
      <Card className="overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredSubscriptions}
          rowKey={(r) => r.id}
          loading={loading}
          pageSize={10}
          searchable={false}
          emptyTitle="No subscriptions found"
          emptyDescription="Try adjusting your search or filter criteria"
          emptyAction={
            <Button onClick={handleCreateSubscription}>
              <Plus /> Create First Subscription
            </Button>
          }
          mobileCard={(r) => (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Avatar name={r.tenantName} size={6} />
                  <span className="font-medium">{r.tenantName}</span>
                </div>
                <SubscriptionStatusBadge status={r.status} />
              </div>
              <div className="flex items-center justify-between gap-2 text-sm">
                <PlanBadge plan={r.plan} />
                <span className="text-muted-foreground">{r.id}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold tabular-nums">{formatKES(r.amount)}</span>
                <span className="text-xs text-muted-foreground capitalize">{r.billingCycle}</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>{r.users}/{r.maxUsers} users</span>
                <span>{formatDate(r.nextBilling, true)}</span>
              </div>
            </div>
          )}
        />
      </Card>

      {/* Billing Overview */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold tracking-tight">Billing Overview</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Current month billing summary</p>
          </div>
          <NativeSelect aria-label="Time period" defaultValue="current" className="w-[140px]">
            <option value="current">This Month</option>
            <option value="last">Last Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </NativeSelect>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            <BillingSummaryCard
              label="Expected Revenue"
              value="KSh 4.2M"
              icon={TrendingUp}
              iconColor="text-emerald-600"
              bgColor="bg-emerald-50"
            />
            <BillingSummaryCard
              label="Collected"
              value="KSh 3.8M"
              icon={CheckCircle2}
              iconColor="text-blue-600"
              bgColor="bg-blue-50"
            />
            <BillingSummaryCard
              label="Pending"
              value="KSh 350K"
              icon={Clock}
              iconColor="text-amber-600"
              bgColor="bg-amber-50"
            />
            <BillingSummaryCard
              label="Overdue"
              value="KSh 50K"
              icon={AlertTriangle}
              iconColor="text-red-600"
              bgColor="bg-red-50"
            />
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-[15px] font-semibold tracking-tight">Quick Actions</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Common subscription management tasks</p>
        </div>
        
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          <QuickActionButton
            icon={Plus}
            label="Create Subscription"
            description="Add new tenant subscription"
            onClick={handleCreateSubscription}
          />
          <QuickActionButton
            icon={RefreshCw}
            label="Process Payments"
            description="Process pending payments"
            onClick={() => toast.info("Processing payments", { description: "Payment processing will begin shortly" })}
          />
          <QuickActionButton
            icon={FileText}
            label="Generate Invoices"
            description="Create monthly invoices"
            onClick={() => toast.success("Invoices generated", { description: "All invoices have been generated and sent" })}
          />
          <QuickActionButton
            icon={Users}
            label="Plan Upgrades"
            description="Manage upgrade requests"
            onClick={() => toast.info("Opening upgrades", { description: "Redirecting to upgrade requests" })}
          />
        </div>
      </Card>
    </div>
  );
}

function PlanCard({
  name,
  price,
  period,
  description,
  icon: Icon,
  iconColor,
  bgColor,
  borderColor,
  features,
  tenants,
  revenue,
  popular,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  icon: any;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  features: typeof planFeatures;
  tenants: number;
  revenue: string;
  popular?: boolean;
}) {
  return (
    <Card className={cn("p-5 relative", borderColor, popular && "ring-2 ring-primary ring-offset-2")}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
          Most Popular
        </div>
      )}
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("flex size-10 items-center justify-center rounded-lg", bgColor)}>
          <Icon className={cn("size-5", iconColor)} />
        </div>
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-2xl font-bold">{price}</div>
        <div className="text-sm text-muted-foreground">{period}</div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Active Tenants</span>
          <span className="font-medium">{tenants}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Monthly Revenue</span>
          <span className="font-medium">{revenue}</span>
        </div>
      </div>
      
      <div className="space-y-1.5 mb-4">
        {features.slice(0, 4).map((feature, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="size-3 text-emerald-600" />
            <span>{feature.feature}</span>
          </div>
        ))}
        {features.length > 4 && (
          <div className="text-xs text-muted-foreground">
            +{features.length - 4} more features
          </div>
        )}
      </div>
      
      <Button variant="outline" className="w-full" size="sm">
        View Details
      </Button>
    </Card>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const planConfig = {
    starter: {
      label: "Starter",
      className: "bg-slate-100 text-slate-700 border-slate-200",
    },
    professional: {
      label: "Professional",
      className: "bg-primary/10 text-primary border-primary/20",
    },
    enterprise: {
      label: "Enterprise",
      className: "bg-navy/10 text-navy border-navy/20",
    },
  };

  const config = planConfig[plan as keyof typeof planConfig] || planConfig.starter;

  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", config.className)}>
      {config.label}
    </span>
  );
}

function SubscriptionStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    active: {
      label: "Active",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
      icon: CheckCircle2,
    },
    trial: {
      label: "Trial",
      className: "bg-blue-50 text-blue-700 ring-blue-200/60",
      icon: Clock,
    },
    past_due: {
      label: "Past Due",
      className: "bg-red-50 text-red-700 ring-red-200/60",
      icon: AlertTriangle,
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-slate-100 text-slate-700 ring-slate-200/60",
      icon: XCircle,
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
  const Icon = config.icon;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 w-fit">
      <Icon className="size-3" />
      {config.label}
    </span>
  );
}

function SubscriptionActions({ subscription }: { subscription: Subscription }) {
  const handleView = () => {
    toast.info(`Viewing ${subscription.tenantName}`, {
      description: "Opening subscription details",
    });
  };

  const handleCancel = () => {
    toast.success(`${subscription.tenantName} subscription cancelled`, {
      description: "Subscription has been cancelled successfully",
    });
  };

  const handleUpgrade = () => {
    toast.info(`Upgrade ${subscription.tenantName}`, {
      description: "Opening upgrade options",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={handleView}>
          <Eye /> View Details
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast.info("Editing subscription", { description: "Opening edit form" })}>
          <FileText /> Edit Subscription
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleUpgrade}>
          <ArrowUpRight /> Upgrade Plan
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => toast.info("Viewing billing history", { description: "Opening billing history" })}>
          <CreditCard /> Billing History
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast.info("Viewing invoices", { description: "Opening invoice list" })}>
          <FileText /> Invoices
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => toast.success("Payment reminder sent", { description: "Payment reminder has been sent to tenant" })}>
          <Clock /> Send Payment Reminder
        </DropdownMenuItem>
        {subscription.status === "active" ? (
          <DropdownMenuItem onSelect={handleCancel}>
            <XCircle /> Cancel Subscription
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={() => toast.success("Subscription reactivated", { description: "Subscription has been reactivated" })}>
            <RefreshCw /> Reactivate
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function BillingSummaryCard({
  label,
  value,
  icon: Icon,
  iconColor,
  bgColor,
}: {
  label: string;
  value: string;
  icon: any;
  iconColor: string;
  bgColor: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={cn("flex size-8 items-center justify-center rounded-lg", bgColor)}>
          <Icon className={cn("size-4", iconColor)} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold tabular-nums">{value}</p>
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({
  icon: Icon,
  label,
  description,
  onClick,
}: {
  icon: any;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group text-left"
    >
      <div className="rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm">
        <Icon className="size-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </button>
  );
}

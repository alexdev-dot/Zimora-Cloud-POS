"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Eye,
  FileText,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  Users,
  XCircle,
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

// Mock tenant data - replace with actual API calls
const mockTenants = [
  {
    id: "1",
    businessName: "ABC Supermarket",
    logo: null,
    status: "active",
    plan: "professional",
    users: 12,
    monthlyRevenue: 45000,
    healthScore: 95,
    createdAt: "2024-01-15T10:30:00Z",
    lastActive: "2024-09-13T08:45:00Z",
    location: "Nairobi",
  },
  {
    id: "2",
    businessName: "XYZ Electronics",
    logo: null,
    status: "active",
    plan: "enterprise",
    users: 45,
    monthlyRevenue: 120000,
    healthScore: 88,
    createdAt: "2024-02-20T14:20:00Z",
    lastActive: "2024-09-13T09:15:00Z",
    location: "Mombasa",
  },
  {
    id: "3",
    businessName: "Quick Mart",
    logo: null,
    status: "trial",
    plan: "starter",
    users: 3,
    monthlyRevenue: 5000,
    healthScore: 72,
    createdAt: "2024-09-01T08:00:00Z",
    lastActive: "2024-09-12T16:30:00Z",
    location: "Kisumu",
  },
  {
    id: "4",
    businessName: "Fresh Foods Ltd",
    logo: null,
    status: "suspended",
    plan: "professional",
    users: 8,
    monthlyRevenue: 28000,
    healthScore: 45,
    createdAt: "2023-11-10T11:45:00Z",
    lastActive: "2024-09-10T12:00:00Z",
    location: "Nakuru",
  },
  {
    id: "5",
    businessName: "Tech Hub",
    logo: null,
    status: "active",
    plan: "professional",
    users: 15,
    monthlyRevenue: 55000,
    healthScore: 92,
    createdAt: "2024-03-05T09:00:00Z",
    lastActive: "2024-09-13T07:30:00Z",
    location: "Eldoret",
  },
];

type Tenant = typeof mockTenants[0];

export default function TenantsPage() {
  const loading = useSimulatedLoading(450);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [planFilter, setPlanFilter] = React.useState("all");

  const filteredTenants = React.useMemo(() => {
    return mockTenants.filter((tenant) => {
      const matchesSearch = tenant.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tenant.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || tenant.status === statusFilter;
      const matchesPlan = planFilter === "all" || tenant.plan === planFilter;
      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [searchQuery, statusFilter, planFilter]);

  const columns: ColumnDef<Tenant>[] = [
    {
      id: "business",
      header: "Business",
      accessor: (r) => r.businessName,
      sortable: true,
      cell: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.businessName} size={8} />
          <div>
            <p className="font-medium">{r.businessName}</p>
            <p className="text-xs text-muted-foreground">{r.location}</p>
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessor: (r) => r.status,
      cell: (r) => <TenantStatusBadge status={r.status} />,
    },
    {
      id: "plan",
      header: "Plan",
      accessor: (r) => r.plan,
      cell: (r) => <PlanBadge plan={r.plan} />,
    },
    {
      id: "users",
      header: "Users",
      accessor: (r) => r.users,
      align: "right",
      sortable: true,
      cell: (r) => (
        <div className="flex items-center gap-1 justify-end">
          <Users className="size-3.5 text-muted-foreground" />
          <span className="font-medium tabular-nums">{r.users}</span>
        </div>
      ),
    },
    {
      id: "revenue",
      header: "Monthly Revenue",
      accessor: (r) => r.monthlyRevenue,
      align: "right",
      sortable: true,
      cell: (r) => <span className="font-semibold tabular-nums">{formatKES(r.monthlyRevenue)}</span>,
    },
    {
      id: "health",
      header: "Health",
      accessor: (r) => r.healthScore,
      align: "right",
      sortable: true,
      cell: (r) => <HealthScore score={r.healthScore} />,
    },
    {
      id: "created",
      header: "Created",
      accessor: (r) => r.createdAt,
      hideBelow: "lg",
      cell: (r) => <span className="text-muted-foreground">{formatDate(r.createdAt, true)}</span>,
    },
    {
      id: "actions",
      header: "",
      cell: (r) => <TenantActions tenant={r} />,
    },
  ];

  const handleExport = (format: string) => {
    toast.success(`Export started`, {
      description: `Your ${format} report will download shortly`,
    });
  };

  const handleAddTenant = () => {
    toast.info("Add tenant modal", {
      description: "Tenant creation form will open in a modal",
    });
  };

  return (
    <div className="page space-y-5">
      <PageHeader
        title="All Tenants"
        description="Manage and monitor all business accounts on the platform"
        actions={
          <>
            <Button onClick={handleAddTenant}>
              <Plus /> Add Tenant
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
          label="Total Tenants"
          value="1,247"
          icon={Building2}
          iconTone="primary"
          change={{ value: 12.5, caption: "vs last month", goodWhenUp: true }}
        />
        <MetricCard
          loading={loading}
          label="Active Tenants"
          value="1,180"
          icon={CheckCircle2}
          iconTone="primary"
          change={{ value: 8.3, caption: "vs last month", goodWhenUp: true }}
        />
        <MetricCard
          loading={loading}
          label="Trial Users"
          value="45"
          icon={Clock}
          iconTone="info"
          change={{ value: -5, caption: "vs last week", goodWhenUp: false }}
        />
        <MetricCard
          loading={loading}
          label="Suspended"
          value="22"
          icon={AlertTriangle}
          iconTone="warning"
          change={{ value: -3, caption: "vs last week", goodWhenUp: true }}
        />
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search tenants by name or location..."
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
              <option value="suspended">Suspended</option>
              <option value="expired">Expired</option>
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
            <span>{filteredTenants.length} tenants</span>
            <span>•</span>
            <Link href="/admin/subscriptions" className="text-primary hover:underline">
              Manage subscriptions
            </Link>
          </div>
        </div>
      </Card>

      {/* Tenants Table */}
      <Card className="overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredTenants}
          rowKey={(r) => r.id}
          loading={loading}
          pageSize={10}
          searchable={false}
          emptyTitle="No tenants found"
          emptyDescription="Try adjusting your search or filter criteria"
          emptyAction={
            <Button onClick={handleAddTenant}>
              <Plus /> Add First Tenant
            </Button>
          }
          mobileCard={(r) => (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Avatar name={r.businessName} size={6} />
                  <span className="font-medium">{r.businessName}</span>
                </div>
                <TenantStatusBadge status={r.status} />
              </div>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">{r.location}</span>
                <PlanBadge plan={r.plan} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold tabular-nums">{formatKES(r.monthlyRevenue)}</span>
                <HealthScore score={r.healthScore} />
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>{r.users} users</span>
                <span>{formatDate(r.createdAt, true)}</span>
              </div>
            </div>
          )}
        />
      </Card>

      {/* Quick Actions */}
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-[15px] font-semibold tracking-tight">Quick Actions</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Common tenant management tasks</p>
        </div>
        
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          <QuickActionButton
            icon={Plus}
            label="Add New Tenant"
            description="Create a new tenant account"
            onClick={handleAddTenant}
          />
          <QuickActionButton
            icon={CreditCard}
            label="Manage Subscriptions"
            description="View and manage billing"
            onClick={() => toast.info("Opening subscriptions", { description: "Redirecting to subscriptions page" })}
          />
          <QuickActionButton
            icon={Shield}
            label="Bulk Actions"
            description="Perform operations on multiple tenants"
            onClick={() => toast.info("Bulk actions", { description: "Select tenants to perform bulk operations" })}
          />
          <QuickActionButton
            icon={Users}
            label="Tenant Analytics"
            description="View tenant performance metrics"
            onClick={() => toast.info("Opening analytics", { description: "Redirecting to analytics page" })}
          />
        </div>
      </Card>
    </div>
  );
}

function TenantStatusBadge({ status }: { status: string }) {
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
    suspended: {
      label: "Suspended",
      className: "bg-red-50 text-red-700 ring-red-200/60",
      icon: XCircle,
    },
    expired: {
      label: "Expired",
      className: "bg-amber-50 text-amber-700 ring-amber-200/60",
      icon: AlertTriangle,
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

function HealthScore({ score }: { score: number }) {
  const getColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50";
    if (score >= 60) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums", getColor(score))}>
      <Shield className="size-3" />
      {score}%
    </div>
  );
}

function TenantActions({ tenant }: { tenant: Tenant }) {
  const handleView = () => {
    toast.info(`Viewing ${tenant.businessName}`, {
      description: "Opening tenant details",
    });
  };

  const handleSuspend = () => {
    toast.success(`${tenant.businessName} suspended`, {
      description: "Tenant has been suspended successfully",
    });
  };

  const handleDelete = () => {
    toast.success(`${tenant.businessName} deleted`, {
      description: "Tenant has been deleted permanently",
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
        <DropdownMenuItem onSelect={() => toast.info("Editing tenant", { description: "Opening edit form" })}>
          <Building2 /> Edit Tenant
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast.info("Managing users", { description: "Opening user management" })}>
          <Users /> Manage Users
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => toast.info("Viewing subscription", { description: "Opening subscription details" })}>
          <CreditCard /> Subscription
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast.info("Viewing analytics", { description: "Opening tenant analytics" })}>
          <ArrowUpRight /> Analytics
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {tenant.status === "active" ? (
          <DropdownMenuItem onSelect={handleSuspend}>
            <AlertTriangle /> Suspend Tenant
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={() => toast.success(`${tenant.businessName} activated`, { description: "Tenant has been activated" })}>
            <CheckCircle2 /> Activate Tenant
          </DropdownMenuItem>
        )}
        <DropdownMenuItem destructive onSelect={handleDelete}>
          <XCircle /> Delete Tenant
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
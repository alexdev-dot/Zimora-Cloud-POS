"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CreditCard,
  DollarSign,
  RefreshCw,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatKES } from "@/lib/utils";
import { useSimulatedLoading } from "@/lib/hooks";

export default function AdminDashboardPage() {
  const loading = useSimulatedLoading(450);

  const handleRefresh = () => {
    toast.success("Dashboard refreshed", {
      description: "All metrics have been updated",
    });
  };

  const handleExport = (format: string) => {
    toast.success(`Export started`, {
      description: `Your ${format} report will download shortly`,
    });
  };

  return (
    <div className="page space-y-5">
      <PageHeader
        title="Super Admin Dashboard"
        description="Platform overview and system health monitoring"
        actions={
          <>
            <NativeSelect aria-label="Time range" defaultValue="today" className="w-[140px]">
              <option value="today">Today</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">This quarter</option>
            </NativeSelect>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw /> <span className="max-sm:hidden">Refresh</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Activity /> <span className="max-sm:hidden">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => handleExport("CSV")}>
                  <Activity /> Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleExport("PDF")}>
                  <Activity /> Export PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      {/* KPI cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
          label="Monthly Revenue"
          value="KSh 4.2M"
          icon={DollarSign}
          iconTone="primary"
          change={{ value: 8.3, caption: "vs last month", goodWhenUp: true }}
        />
        <MetricCard
          loading={loading}
          label="Active Users"
          value="8,432"
          icon={Users}
          iconTone="info"
          change={{ value: 15.2, caption: "vs last month", goodWhenUp: true }}
        />
        <MetricCard
          loading={loading}
          label="System Health"
          value="98.5%"
          icon={Activity}
          iconTone="primary"
          change={{ value: 0.5, caption: "vs last week", goodWhenUp: true }}
        />
        <MetricCard
          loading={loading}
          label="Open Tickets"
          value="23"
          icon={AlertTriangle}
          iconTone="warning"
          change={{ value: -3, caption: "vs yesterday", goodWhenUp: false }}
          className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-1"
        />
      </div>

      {/* System Health Panel */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold tracking-tight">System Health Status</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Real-time monitoring of critical systems</p>
          </div>
          <Link href="/admin/health">
            <Button variant="outline" size="sm">
              <Activity /> View Details
            </Button>
          </Link>
        </div>
        
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
            ))
          ) : (
            <>
              <HealthCard
                title="API Status"
                status="operational"
                detail="99.9% uptime"
                icon={Activity}
              />
              <HealthCard
                title="Database"
                status="operational"
                detail="45ms latency"
                icon={Shield}
              />
              <HealthCard
                title="CDN Status"
                status="operational"
                detail="Global edge"
                icon={TrendingUp}
              />
              <HealthCard
                title="Storage"
                status="warning"
                detail="78% used"
                icon={AlertTriangle}
              />
              <HealthCard
                title="Backup"
                status="operational"
                detail="Last: 2h ago"
                icon={RefreshCw}
              />
              <HealthCard
                title="Security"
                status="operational"
                detail="No threats"
                icon={Shield}
              />
            </>
          )}
        </div>
      </Card>

      {/* Charts Section */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold tracking-tight">Tenant Growth</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">New tenant signups over time</p>
            </div>
            <Button variant="ghost" size="sm">
              <TrendingUp /> Analytics
            </Button>
          </div>
          {loading ? (
            <div className="h-[300px] rounded-lg bg-muted animate-pulse" />
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="mx-auto mb-2 size-12 opacity-50" />
                <p className="text-sm">Tenant growth chart will appear here</p>
                <p className="text-xs text-muted-foreground">Connect analytics API to display data</p>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold tracking-tight">Revenue by Plan</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Revenue distribution across subscription tiers</p>
            </div>
            <Button variant="ghost" size="sm">
              <CreditCard /> Subscriptions
            </Button>
          </div>
          {loading ? (
            <div className="h-[300px] rounded-lg bg-muted animate-pulse" />
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              <div className="text-center">
                <CreditCard className="mx-auto mb-2 size-12 opacity-50" />
                <p className="text-sm">Revenue chart will appear here</p>
                <p className="text-xs text-muted-foreground">Connect billing API to display data</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold tracking-tight">Recent Activity</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Latest platform events and alerts</p>
          </div>
          <Link href="/admin/audit">
            <Button variant="outline" size="sm">
              <Activity /> View All
            </Button>
          </Link>
        </div>
        
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <ActivityItem
              type="new_tenant"
              title="New tenant signup"
              description="ABC Corp joined the Professional plan"
              time="2 minutes ago"
              icon={Building2}
            />
            <ActivityItem
              type="subscription"
              title="Subscription upgrade"
              description="XYZ Ltd upgraded to Enterprise plan"
              time="15 minutes ago"
              icon={CreditCard}
            />
            <ActivityItem
              type="alert"
              title="System alert resolved"
              description="Database latency issue has been resolved"
              time="1 hour ago"
              icon={Activity}
            />
            <ActivityItem
              type="security"
              title="Security audit completed"
              description="Monthly security scan passed with no issues"
              time="2 hours ago"
              icon={Shield}
            />
            <ActivityItem
              type="support"
              title="Support ticket escalated"
              description="Ticket #1234 escalated to tier 2 support"
              time="3 hours ago"
              icon={Users}
            />
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-[15px] font-semibold tracking-tight">Quick Actions</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Common admin tasks</p>
        </div>
        
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          <QuickActionButton
            icon={Building2}
            label="Add Tenant"
            description="Create new tenant account"
            href="/admin/tenants?action=new"
          />
          <QuickActionButton
            icon={Users}
            label="Manage Users"
            description="Admin and staff management"
            href="/admin/users"
          />
          <QuickActionButton
            icon={Shield}
            label="Security Audit"
            description="Review security logs"
            href="/admin/security"
          />
          <QuickActionButton
            icon={Activity}
            label="System Health"
            description="Monitor system performance"
            href="/admin/health"
          />
        </div>
      </Card>
    </div>
  );
}

function HealthCard({ title, status, detail, icon: Icon }: { title: string; status: string; detail: string; icon: any }) {
  const statusColors = {
    operational: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    critical: "bg-red-50 text-red-700 border-red-200",
  };

  const statusIcons = {
    operational: "●",
    warning: "●",
    critical: "●",
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon className="size-4 text-muted-foreground" />
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusColors[status as keyof typeof statusColors]}`}>
          {statusIcons[status as keyof typeof statusIcons]} {status}
        </span>
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{detail}</p>
    </div>
  );
}

function ActivityItem({ type, title, description, time, icon: Icon }: { type: string; title: string; description: string; time: string; icon: any }) {
  const typeColors = {
    new_tenant: "bg-emerald-50 text-emerald-600",
    subscription: "bg-blue-50 text-blue-600",
    alert: "bg-amber-50 text-amber-600",
    security: "bg-purple-50 text-purple-600",
    support: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
      <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${typeColors[type as keyof typeof typeColors]}`}>
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
        <p className="text-[11px] text-muted-foreground mt-1">{time}</p>
      </div>
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, description, href }: { icon: any; label: string; description: string; href: string }) {
  return (
    <Link href={href} className="group">
      <div className="rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-sm">
        <Icon className="size-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </Link>
  );
}
"use client";

import * as React from "react";
import { useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  Calendar,
  CreditCard,
  Download,
  Filter,
  Globe,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

export default function AdminAnalyticsPage() {
  const loading = useSimulatedLoading(450);
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  const handleRefresh = () => {
    toast.success("Analytics refreshed", {
      description: "All metrics have been updated",
    });
  };

  const handleExport = (format: string) => {
    toast.success(`Export started`, {
      description: `Your ${format} report will download shortly`,
    });
  };

  return (
    <div className="page space-y-6">
      <PageHeader
        title="Analytics Dashboard"
        description="Comprehensive platform analytics and performance metrics"
        actions={
          <>
            <NativeSelect
              aria-label="Time range"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-[140px]"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </NativeSelect>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw /> <span className="max-sm:hidden">Refresh</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download /> <span className="max-sm:hidden">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => handleExport("CSV")}>
                  <Download /> Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleExport("PDF")}>
                  <Download /> Export PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <MetricCard
          loading={loading}
          label="Total Revenue"
          value="KSh 12.4M"
          icon={Wallet}
          iconTone="primary"
          change={{ value: 18.5, caption: "vs last period", goodWhenUp: true }}
        />
        <MetricCard
          loading={loading}
          label="Active Tenants"
          value="1,247"
          icon={Building2}
          iconTone="primary"
          change={{ value: 12.3, caption: "vs last period", goodWhenUp: true }}
        />
        <MetricCard
          loading={loading}
          label="Total Users"
          value="8,432"
          icon={Users}
          iconTone="info"
          change={{ value: 15.2, caption: "vs last period", goodWhenUp: true }}
        />
        <MetricCard
          loading={loading}
          label="Avg Revenue/Tenant"
          value="KSh 9.9K"
          icon={CreditCard}
          iconTone="primary"
          change={{ value: 5.4, caption: "vs last period", goodWhenUp: true }}
        />
        <MetricCard
          loading={loading}
          label="New Signups"
          value="156"
          icon={TrendingUp}
          iconTone="primary"
          change={{ value: 22.1, caption: "vs last period", goodWhenUp: true }}
        />
        <MetricCard
          loading={loading}
          label="Churn Rate"
          value="2.3%"
          icon={TrendingDown}
          iconTone="warning"
          change={{ value: -0.8, caption: "vs last period", goodWhenUp: false }}
        />
      </div>

      {/* Revenue Analytics */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Revenue over selected time period</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedMetric === "revenue" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMetric("revenue")}
              >
                Revenue
              </Button>
              <Button
                variant={selectedMetric === "mrr" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMetric("mrr")}
              >
                MRR
              </Button>
            </div>
          </div>
          {loading ? (
            <div className="h-[300px] rounded-lg bg-muted animate-pulse" />
          ) : (
            <RevenueChart />
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <CardTitle>Revenue by Plan</CardTitle>
            <CardDescription>Distribution across subscription tiers</CardDescription>
          </div>
          {loading ? (
            <div className="h-[300px] rounded-lg bg-muted animate-pulse" />
          ) : (
            <RevenueByPlanChart />
          )}
        </Card>
      </div>

      {/* User Analytics */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card className="p-5">
          <div className="mb-4">
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New user acquisitions over time</CardDescription>
          </div>
          {loading ? (
            <div className="h-[250px] rounded-lg bg-muted animate-pulse" />
          ) : (
            <UserGrowthChart />
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <CardTitle>User Activity</CardTitle>
            <CardDescription>Daily active users vs total users</CardDescription>
          </div>
          {loading ? (
            <div className="h-[250px] rounded-lg bg-muted animate-pulse" />
          ) : (
            <UserActivityChart />
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <CardTitle>User Retention</CardTitle>
            <CardDescription>Cohort retention rates</CardDescription>
          </div>
          {loading ? (
            <div className="h-[250px] rounded-lg bg-muted animate-pulse" />
          ) : (
            <UserRetentionChart />
          )}
        </Card>
      </div>

      {/* Tenant Analytics */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4">
            <CardTitle>Tenant Growth</CardTitle>
            <CardDescription>New tenant signups and cancellations</CardDescription>
          </div>
          {loading ? (
            <div className="h-[300px] rounded-lg bg-muted animate-pulse" />
          ) : (
            <TenantGrowthChart />
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <CardTitle>Tenant Distribution</CardTitle>
            <CardDescription>Tenants by industry and region</CardDescription>
          </div>
          {loading ? (
            <div className="h-[300px] rounded-lg bg-muted animate-pulse" />
          ) : (
            <TenantDistributionChart />
          )}
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <CardTitle>System Performance</CardTitle>
            <CardDescription>Key performance indicators and system health</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Activity /> Details
          </Button>
        </div>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <PerformanceMetric
              label="API Response Time"
              value="45ms"
              change={-12}
              goodWhenDown={true}
              icon={Activity}
            />
            <PerformanceMetric
              label="Database Latency"
              value="23ms"
              change={-8}
              goodWhenDown={true}
              icon={Globe}
            />
            <PerformanceMetric
              label="Error Rate"
              value="0.02%"
              change={-0.01}
              goodWhenDown={true}
              icon={TrendingDown}
            />
            <PerformanceMetric
              label="Uptime"
              value="99.95%"
              change={0.05}
              goodWhenDown={false}
              icon={Activity}
            />
          </div>
        )}
      </Card>

      {/* Top Performers */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4">
            <CardTitle>Top Performing Tenants</CardTitle>
            <CardDescription>Highest revenue generating tenants</CardDescription>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <TopTenantsList />
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform events and transactions</CardDescription>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <RecentActivityList />
          )}
        </Card>
      </div>
    </div>
  );
}

function RevenueChart() {
  return (
    <div className="h-[300px] flex items-center justify-center">
      <div className="text-center">
        <BarChart3 className="mx-auto mb-2 size-12 opacity-50 text-primary" />
        <p className="text-sm font-medium">Revenue Trend Chart</p>
        <p className="text-xs text-muted-foreground">Line chart showing revenue over time</p>
        <div className="mt-4 flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-primary" />
            <span>Current Period</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-slate-300" />
            <span>Previous Period</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RevenueByPlanChart() {
  const plans = [
    { name: "Starter", value: 15, color: "bg-slate-400" },
    { name: "Professional", value: 45, color: "bg-primary" },
    { name: "Enterprise", value: 30, color: "bg-sky-500" },
    { name: "Custom", value: 10, color: "bg-amber-500" },
  ];

  return (
    <div className="h-[300px] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-6">
          <div className="relative size-40">
            <div className="absolute inset-0 rounded-full border-8 border-slate-100" />
            <div className="absolute inset-0 rounded-full border-8 border-slate-400 border-t-transparent border-l-transparent rotate-45" style={{ transform: "rotate(0deg)" }} />
            <div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent border-l-transparent" style={{ transform: "rotate(54deg)" }} />
            <div className="absolute inset-0 rounded-full border-8 border-sky-500 border-t-transparent border-l-transparent" style={{ transform: "rotate(216deg)" }} />
            <div className="absolute inset-0 rounded-full border-8 border-amber-500 border-t-transparent border-l-transparent" style={{ transform: "rotate(324deg)" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold">KSh 12.4M</p>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {plans.map((plan) => (
            <div key={plan.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`size-3 rounded-full ${plan.color}`} />
                <span>{plan.name}</span>
              </div>
              <span className="font-medium">{plan.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UserGrowthChart() {
  return (
    <div className="h-[250px] flex items-center justify-center">
      <div className="text-center">
        <TrendingUp className="mx-auto mb-2 size-10 opacity-50 text-emerald-500" />
        <p className="text-sm font-medium">User Growth Chart</p>
        <p className="text-xs text-muted-foreground">+15.2% vs last period</p>
        <div className="mt-4 grid grid-cols-7 gap-1">
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              className="size-6 rounded-sm bg-primary/20 hover:bg-primary/40 transition-colors"
              style={{
                height: `${20 + Math.random() * 80}%`,
                minHeight: "8px",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function UserActivityChart() {
  return (
    <div className="h-[250px] flex items-center justify-center">
      <div className="text-center">
        <Users className="mx-auto mb-2 size-10 opacity-50 text-blue-500" />
        <p className="text-sm font-medium">Daily Active Users</p>
        <p className="text-xs text-muted-foreground">6,234 DAU / 8,432 Total</p>
        <div className="mt-4 flex items-end justify-center gap-2 h-24">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="w-4 rounded-t bg-blue-500/60 hover:bg-blue-500 transition-colors"
              style={{
                height: `${30 + Math.random() * 70}%`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function UserRetentionChart() {
  const cohorts = [
    { period: "Week 1", rate: 100 },
    { period: "Week 2", rate: 85 },
    { period: "Week 3", rate: 72 },
    { period: "Week 4", rate: 65 },
  ];

  return (
    <div className="h-[250px] flex items-center justify-center">
      <div className="w-full max-w-xs">
        <p className="text-sm font-medium mb-4">Cohort Retention</p>
        <div className="space-y-3">
          {cohorts.map((cohort) => (
            <div key={cohort.period} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{cohort.period}</span>
                <span className="font-medium">{cohort.rate}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${cohort.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TenantGrowthChart() {
  return (
    <div className="h-[300px] flex items-center justify-center">
      <div className="text-center">
        <Building2 className="mx-auto mb-2 size-12 opacity-50 text-primary" />
        <p className="text-sm font-medium">Tenant Growth</p>
        <p className="text-xs text-muted-foreground">+156 new tenants this period</p>
        <div className="mt-4 flex items-end justify-center gap-3 h-32">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="w-8 rounded-t bg-primary/60 hover:bg-primary transition-colors"
                style={{
                  height: `${20 + Math.random() * 80}%`,
                }}
              />
              <span className="text-[10px] text-muted-foreground">W{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TenantDistributionChart() {
  const industries = [
    { name: "Retail", count: 423, percentage: 34 },
    { name: "Restaurant", count: 312, percentage: 25 },
    { name: "Wholesale", count: 249, percentage: 20 },
    { name: "Services", count: 187, percentage: 15 },
    { name: "Other", count: 76, percentage: 6 },
  ];

  return (
    <div className="h-[300px] flex items-center justify-center">
      <div className="w-full space-y-3">
        {industries.map((industry) => (
          <div key={industry.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{industry.name}</span>
              <span className="text-muted-foreground">{industry.count} tenants ({industry.percentage}%)</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${industry.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PerformanceMetric({
  label,
  value,
  change,
  goodWhenDown,
  icon: Icon,
}: {
  label: string;
  value: string;
  change: number;
  goodWhenDown?: boolean;
  icon: any;
}) {
  const isGood = goodWhenDown ? change < 0 : change > 0;

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <Icon className="size-4 text-muted-foreground" />
        <div className="flex items-center gap-1 text-xs">
          {isGood ? (
            <ArrowUpRight className="size-3 text-emerald-500" />
          ) : (
            <ArrowDownRight className="size-3 text-red-500" />
          )}
          <span className={cn(isGood ? "text-emerald-600" : "text-red-600", "font-medium")}>
            {Math.abs(change)}%
          </span>
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function TopTenantsList() {
  const tenants = [
    { name: "ABC Supermarkets", revenue: "KSh 1.2M", growth: "+24%" },
    { name: "QuickMart Stores", revenue: "KSh 980K", growth: "+18%" },
    { name: "Fresh Grocers Ltd", revenue: "KSh 875K", growth: "+15%" },
    { name: "City Electronics", revenue: "KSh 720K", growth: "+12%" },
    { name: "Value Mart", revenue: "KSh 650K", growth: "+10%" },
  ];

  return (
    <div className="space-y-3">
      {tenants.map((tenant, index) => (
        <div key={index} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
              {index + 1}
            </div>
            <div>
              <p className="text-sm font-medium">{tenant.name}</p>
              <p className="text-xs text-muted-foreground">{tenant.revenue}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
            <TrendingUp className="size-4" />
            {tenant.growth}
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentActivityList() {
  const activities = [
    { type: "signup", message: "New tenant signup: Tech Solutions Inc", time: "2 min ago", icon: Building2 },
    { type: "upgrade", message: "Subscription upgrade: Global Retail Corp", time: "15 min ago", icon: CreditCard },
    { type: "payment", message: "Payment received: KSh 45,000 from QuickMart", time: "1 hour ago", icon: Wallet },
    { type: "alert", message: "System alert: High API latency detected", time: "2 hours ago", icon: Activity },
    { type: "user", message: "New admin user created for Fresh Grocers", time: "3 hours ago", icon: Users },
  ];

  const typeColors = {
    signup: "bg-emerald-50 text-emerald-600",
    upgrade: "bg-blue-50 text-blue-600",
    payment: "bg-amber-50 text-amber-600",
    alert: "bg-red-50 text-red-600",
    user: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => {
        const Icon = activity.icon;
        return (
          <div key={index} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
            <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${typeColors[activity.type as keyof typeof typeColors]}`}>
              <Icon className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{activity.message}</p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
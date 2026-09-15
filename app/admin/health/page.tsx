"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Cpu,
  Database,
  HardDrive,
  RefreshCw,
  Server,
  Shield,
  TrendingUp,
  XCircle,
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
import { cn, timeAgo } from "@/lib/utils";
import { useSimulatedLoading } from "@/lib/hooks";

export default function SystemHealthPage() {
  const loading = useSimulatedLoading(450);
  const [autoRefresh, setAutoRefresh] = React.useState(true);
  const [lastRefresh, setLastRefresh] = React.useState(new Date());

  const handleRefresh = () => {
    setLastRefresh(new Date());
    toast.success("System health refreshed", {
      description: "All metrics have been updated",
    });
  };

  const handleRunDiagnostics = () => {
    toast.info("Running diagnostics", {
      description: "System diagnostics will complete in approximately 2 minutes",
    });
  };

  return (
    <div className="page space-y-5">
      <PageHeader
        title="System Health"
        description="Real-time monitoring of platform infrastructure and services"
        actions={
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Last updated: {timeAgo(lastRefresh.toISOString())}</span>
              {autoRefresh && (
                <span className="flex items-center gap-1 text-emerald-600">
                  <RefreshCw className="size-3 animate-spin" />
                  Auto-refreshing
                </span>
              )}
            </div>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw /> Refresh
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Activity /> Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setAutoRefresh(!autoRefresh)}>
                  <RefreshCw /> {autoRefresh ? "Disable Auto-refresh" : "Enable Auto-refresh"}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleRunDiagnostics}>
                  <Activity /> Run Diagnostics
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => toast.success("Report generated", { description: "Health report will download shortly" })}>
                  <TrendingUp /> Export Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      {/* Overall Health Status */}
      <Card className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="size-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-900">All Systems Operational</h2>
              <p className="text-emerald-700">Platform is running normally with no critical issues detected</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-emerald-900">98.5%</div>
            <div className="text-sm text-emerald-700">Overall Health Score</div>
          </div>
        </div>
      </Card>

      {/* System Overview Metrics */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <MetricCard
          loading={loading}
          label="Server Uptime"
          value="99.9%"
          icon={Server}
          iconTone="primary"
          change={{ value: 0.1, caption: "vs last month", goodWhenUp: true }}
        />
        <MetricCard
          loading={loading}
          label="API Response Time"
          value="45ms"
          icon={Activity}
          iconTone="primary"
          change={{ value: -5, caption: "vs last hour", goodWhenUp: false }}
        />
        <MetricCard
          loading={loading}
          label="Database Latency"
          value="12ms"
          icon={Database}
          iconTone="primary"
          change={{ value: -2, caption: "vs last hour", goodWhenUp: false }}
        />
        <MetricCard
          loading={loading}
          label="Active Connections"
          value="1,247"
          icon={TrendingUp}
          iconTone="info"
          change={{ value: 8.3, caption: "vs last hour", goodWhenUp: true }}
        />
      </div>

      {/* Component Status Grid */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold tracking-tight">Component Status</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Real-time status of all system components</p>
          </div>
          <NativeSelect aria-label="Filter by status" defaultValue="all" className="w-[140px]">
            <option value="all">All Status</option>
            <option value="operational">Operational</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </NativeSelect>
        </div>
        
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
            ))
          ) : (
            <>
              <ComponentStatusCard
                name="API Gateway"
                status="operational"
                uptime="99.9%"
                responseTime="45ms"
                lastChecked="2 minutes ago"
                icon={Activity}
              />
              <ComponentStatusCard
                name="Primary Database"
                status="operational"
                uptime="99.8%"
                responseTime="12ms"
                lastChecked="1 minute ago"
                icon={Database}
              />
              <ComponentStatusCard
                name="CDN Network"
                status="operational"
                uptime="100%"
                responseTime="23ms"
                lastChecked="30 seconds ago"
                icon={Server}
              />
              <ComponentStatusCard
                name="Storage System"
                status="warning"
                uptime="98.5%"
                responseTime="89ms"
                lastChecked="5 minutes ago"
                icon={HardDrive}
                warning="78% capacity used"
              />
              <ComponentStatusCard
                name="Backup Service"
                status="operational"
                uptime="99.9%"
                responseTime="N/A"
                lastChecked="2 hours ago"
                icon={RefreshCw}
                lastBackup="2 hours ago"
              />
              <ComponentStatusCard
                name="Security Systems"
                status="operational"
                uptime="100%"
                responseTime="8ms"
                lastChecked="1 minute ago"
                icon={Shield}
              />
            </>
          )}
        </div>
      </Card>

      {/* Resource Usage */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold tracking-tight">Server Resources</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">CPU, Memory, and Disk usage across all servers</p>
            </div>
            <Link href="/admin/health/servers">
              <Button variant="outline" size="sm">
                <Server /> View All Servers
              </Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <ResourceBar
                label="CPU Usage"
                value={67}
                max={100}
                unit="%"
                status="normal"
                icon={Cpu}
              />
              <ResourceBar
                label="Memory Usage"
                value={78}
                max={100}
                unit="%"
                status="warning"
                icon={Activity}
                warning="Approaching limit"
              />
              <ResourceBar
                label="Disk Usage"
                value={45}
                max={100}
                unit="%"
                status="normal"
                icon={HardDrive}
              />
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold tracking-tight">Recent Alerts</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Latest system alerts and notifications</p>
            </div>
            <Link href="/admin/health/alerts">
              <Button variant="outline" size="sm">
                <AlertTriangle /> View All Alerts
              </Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <AlertItem
                type="warning"
                title="High Memory Usage"
                description="Server prod-01 memory usage exceeded 75%"
                time="15 minutes ago"
                icon={AlertTriangle}
              />
              <AlertItem
                type="info"
                title="Scheduled Maintenance"
                description="Database maintenance scheduled for tonight at 2 AM"
                time="1 hour ago"
                icon={Activity}
              />
              <AlertItem
                type="success"
                title="Backup Completed"
                description="Daily backup completed successfully"
                time="2 hours ago"
                icon={CheckCircle2}
              />
              <AlertItem
                type="critical"
                title="API Latency Spike"
                description="API response time increased to 200ms for 5 minutes"
                time="3 hours ago"
                icon={XCircle}
                resolved="Resolved after 8 minutes"
              />
            </div>
          )}
        </Card>
      </div>

      {/* Performance Charts */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold tracking-tight">Performance Trends</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Historical performance data over the last 24 hours</p>
          </div>
          <NativeSelect aria-label="Time range" defaultValue="24h" className="w-[140px]">
            <option value="1h">Last 1 hour</option>
            <option value="6h">Last 6 hours</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
          </NativeSelect>
        </div>
        
        {loading ? (
          <div className="h-[300px] rounded-lg bg-muted animate-pulse" />
        ) : (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="mx-auto mb-2 size-12 opacity-50" />
              <p className="text-sm">Performance chart will appear here</p>
              <p className="text-xs text-muted-foreground">Connect monitoring API to display real-time data</p>
            </div>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-[15px] font-semibold tracking-tight">Quick Actions</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Common system administration tasks</p>
        </div>
        
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          <QuickActionButton
            icon={RefreshCw}
            label="Restart Services"
            description="Restart selected services"
            onClick={() => toast.info("Service restart initiated", { description: "Services will restart in 2 minutes" })}
          />
          <QuickActionButton
            icon={Database}
            label="Database Backup"
            description="Create immediate backup"
            onClick={() => toast.success("Backup started", { description: "Backup will complete in approximately 10 minutes" })}
          />
          <QuickActionButton
            icon={Shield}
            label="Security Scan"
            description="Run security diagnostics"
            onClick={() => toast.info("Security scan started", { description: "Scan will complete in approximately 15 minutes" })}
          />
          <QuickActionButton
            icon={Activity}
            label="View Logs"
            description="Access system logs"
            onClick={() => toast.info("Opening logs viewer", { description: "Logs viewer will open in new tab" })}
          />
        </div>
      </Card>
    </div>
  );
}

function ComponentStatusCard({
  name,
  status,
  uptime,
  responseTime,
  lastChecked,
  icon: Icon,
  warning,
  lastBackup,
}: {
  name: string;
  status: "operational" | "warning" | "critical";
  uptime: string;
  responseTime: string;
  lastChecked: string;
  icon: any;
  warning?: string;
  lastBackup?: string;
}) {
  const statusConfig = {
    operational: {
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-200",
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
    },
    warning: {
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      borderColor: "border-amber-200",
      icon: AlertTriangle,
      iconColor: "text-amber-600",
    },
    critical: {
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      borderColor: "border-red-200",
      icon: XCircle,
      iconColor: "text-red-600",
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className={cn("rounded-lg border p-4 transition-all hover:shadow-md", config.borderColor, config.bgColor)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={cn("size-5", config.iconColor)} />
          <h4 className="font-semibold text-foreground">{name}</h4>
        </div>
        <div className={cn("flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full", config.textColor, config.bgColor)}>
          <StatusIcon className="size-3" />
          {status}
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Uptime:</span>
          <span className="font-medium">{uptime}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Response:</span>
          <span className="font-medium">{responseTime}</span>
        </div>
        {lastBackup && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Backup:</span>
            <span className="font-medium">{lastBackup}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Checked:</span>
          <span className="font-medium">{lastChecked}</span>
        </div>
      </div>
      
      {warning && (
        <div className="mt-3 pt-3 border-t border-current/20">
          <p className="text-xs font-medium text-amber-700">{warning}</p>
        </div>
      )}
    </div>
  );
}

function ResourceBar({
  label,
  value,
  max,
  unit,
  status,
  icon: Icon,
  warning,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  status: "normal" | "warning" | "critical";
  icon: any;
  warning?: string;
}) {
  const percentage = (value / max) * 100;
  
  const statusColors = {
    normal: "bg-emerald-500",
    warning: "bg-amber-500",
    critical: "bg-red-500",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" />
          <span className="font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold tabular-nums">{value}{unit}</span>
          {warning && (
            <span className="text-xs text-amber-600">{warning}</span>
          )}
        </div>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", statusColors[status])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function AlertItem({
  type,
  title,
  description,
  time,
  icon: Icon,
  resolved,
}: {
  type: "success" | "warning" | "critical" | "info";
  title: string;
  description: string;
  time: string;
  icon: any;
  resolved?: string;
}) {
  const typeConfig = {
    success: { bgColor: "bg-emerald-50", iconColor: "text-emerald-600" },
    warning: { bgColor: "bg-amber-50", iconColor: "text-amber-600" },
    critical: { bgColor: "bg-red-50", iconColor: "text-red-600" },
    info: { bgColor: "bg-slate-100", iconColor: "text-slate-600" },
  };

  const config = typeConfig[type];

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
      <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", config.bgColor)}>
        <Icon className={cn("size-4", config.iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">{title}</p>
          {resolved && (
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Resolved</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-[11px] text-muted-foreground">{time}</p>
          {resolved && <p className="text-[11px] text-muted-foreground">• {resolved}</p>}
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
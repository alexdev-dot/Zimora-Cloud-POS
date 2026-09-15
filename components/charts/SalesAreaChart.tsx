"use client";

import * as React from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { compactKES, formatNumber } from "@/lib/utils";
import type { SaleTrendSet } from "@/types";

export type TrendRange = "today" | "week" | "month" | "year";

const RANGE_LABELS: Record<TrendRange, string> = {
  today: "Today",
  week: "7 Days",
  month: "30 Days",
  year: "12 Months",
};

export function SalesAreaChart({
  trend,
  range,
  onRangeChange,
  height = 288,
}: {
  trend: Record<string, SaleTrendSet>;
  range: TrendRange;
  onRangeChange: (r: TrendRange) => void;
  height?: number;
}) {
  const set = trend[range];
  const data = React.useMemo(
    () => set.labels.map((label, i) => ({ label, sales: set.sales[i], orders: set.orders[i] })),
    [set]
  );

  const totalSales = set.sales.reduce((a, b) => a + b, 0);
  const totalOrders = set.orders.reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-5">
          <LegendDot color="#0F766E" label="Sales" value={compactKES(totalSales)} />
          <LegendDot color="#0284C7" label="Orders" value={formatNumber(totalOrders)} />
        </div>
        <div
          role="tablist"
          aria-label="Chart range"
          className="flex items-center gap-0.5 rounded-lg bg-muted p-1"
        >
          {(Object.keys(RANGE_LABELS) as TrendRange[]).map((r) => (
            <button
              key={r}
              role="tab"
              aria-selected={range === r}
              onClick={() => onRangeChange(r)}
              className={
                "rounded-md px-2.5 py-1 text-xs font-medium transition-all focus-ring " +
                (range === r
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {RANGE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0F766E" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#0F766E" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#64748B" }}
              interval="preserveStartEnd"
              minTickGap={28}
              dy={6}
            />
            <YAxis
              yAxisId="sales"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#64748B" }}
              tickFormatter={(v: number) => compactKES(v)}
              width={44}
            />
            <YAxis yAxisId="orders" orientation="right" hide />
            <Tooltip
              cursor={{ stroke: "#94A3B8", strokeDasharray: "4 4" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-2.5 text-white shadow-pop">
                    <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      {label}
                    </p>
                    <p className="flex items-center gap-2 text-[13px] font-semibold tabular-nums">
                      <span className="size-2 rounded-full bg-teal-400" />
                      KSh {(payload[0]?.value as number)?.toLocaleString()}
                    </p>
                    <p className="mt-0.5 flex items-center gap-2 text-[13px] tabular-nums">
                      <span className="size-2 rounded-full bg-sky-400" />
                      {payload[1]?.value as number} orders
                    </p>
                  </div>
                );
              }}
            />
            <Area
              yAxisId="sales"
              type="monotone"
              dataKey="sales"
              stroke="#0F766E"
              strokeWidth={2}
              fill="url(#salesFill)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
            />
            <Line
              yAxisId="orders"
              type="monotone"
              dataKey="orders"
              stroke="#0284C7"
              strokeWidth={1.75}
              dot={false}
              strokeDasharray="0"
              activeDot={{ r: 3.5, strokeWidth: 2, stroke: "#fff" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function LegendDot({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="size-2 rounded-full" style={{ background: color }} />
        {label}
      </p>
      <p className="mt-0.5 text-[15px] font-semibold tabular-nums">{value}</p>
    </div>
  );
}

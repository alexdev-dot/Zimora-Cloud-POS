"use client";

import * as React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatNumber } from "@/lib/utils";

export interface DonutDatum {
  name: string;
  value: number;
  color: string;
}

export function DonutChart({
  data,
  height = 210,
  centerLabel = "Share",
  formatValue = formatNumber,
}: {
  data: DonutDatum[];
  height?: number;
  centerLabel?: string;
  formatValue?: (v: number) => string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative w-full max-w-[210px] shrink-0" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="64%"
              outerRadius="88%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as DonutDatum;
                return (
                  <div className="rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-2 text-white shadow-pop">
                    <p className="text-[13px] font-semibold">{d.name}</p>
                    <p className="text-xs text-slate-300 tabular-nums">
                      {formatValue(d.value)} · {d.value}%
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{centerLabel}</span>
          <span className="text-lg font-semibold tabular-nums">{data[0]?.value ?? 0}%</span>
        </div>
      </div>
      <ul className="w-full min-w-0 space-y-2">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2 text-[13px]">
            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: d.color }} />
            <span className="min-w-0 flex-1 truncate text-muted-foreground">{d.name}</span>
            <span className="font-medium tabular-nums">{formatValue(d.value)}</span>
            <span className="w-9 text-right text-xs text-muted-foreground tabular-nums">{d.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

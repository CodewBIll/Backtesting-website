"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatNumber, getCumulativePnLData } from "@/lib/utils";
import type { Trade } from "@/types/trade";

type PnLChartProps = {
  trades: Trade[];
};

export function PnLChart({ trades }: PnLChartProps) {
  const data = getCumulativePnLData(trades);

  if (!data.length) {
    return <ChartEmptyState label="Cumulative PnL chart will appear once trades are added." />;
  }

  return (
    <div className="h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 16, right: 12, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="pnlFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#6b7280", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "#6b7280", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => formatNumber(value)}
          />
          <Tooltip
            formatter={(value) => [
              `${formatNumber(Number(value ?? 0))} total`,
              "Cumulative PnL",
            ]}
            labelFormatter={(label) => `Date: ${label}`}
            contentStyle={{
              backgroundColor: "#111111",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "18px",
              color: "#f5f5f5",
            }}
          />
          <Area
            type="monotone"
            dataKey="cumulativePnL"
            stroke="#22c55e"
            fill="url(#pnlFill)"
            strokeWidth={3}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartEmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-[320px] items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-black/20 text-sm text-zinc-500">
      {label}
    </div>
  );
}

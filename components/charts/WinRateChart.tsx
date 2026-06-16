"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { formatPercent, getTradeStats } from "@/lib/utils";
import type { Trade } from "@/types/trade";

type WinRateChartProps = {
  trades: Trade[];
};

export function WinRateChart({ trades }: WinRateChartProps) {
  const data = [
    {
      name: "WIN",
      value: trades.filter((trade) => trade.result === "WIN").length,
      fill: "#22c55e",
    },
    {
      name: "LOSS",
      value: trades.filter((trade) => trade.result === "LOSS").length,
      fill: "#ef4444",
    },
    {
      name: "BREAKEVEN",
      value: trades.filter((trade) => trade.result === "BREAKEVEN").length,
      fill: "#3b82f6",
    },
  ].filter((item) => item.value > 0);

  const stats = getTradeStats(trades);

  if (!data.length) {
    return <ChartEmptyState label="Win/loss breakdown will appear once trades are added." />;
  }

  return (
    <div className="h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={74}
            outerRadius={106}
            paddingAngle={4}
            strokeWidth={0}
          >
            {data.map((item) => (
              <Cell key={item.name} fill={item.fill} />
            ))}
          </Pie>
          <Tooltip
            cursor={false}
            contentStyle={{
              backgroundColor: "#111111",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "18px",
              color: "#f5f5f5",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="-mt-[182px] flex flex-col items-center justify-center">
        <span className="text-xs uppercase tracking-[0.32em] text-zinc-500">Win Rate</span>
        <span className="mt-2 font-mono text-4xl font-semibold text-white">
          {formatPercent(stats.winRate)}
        </span>
      </div>

      <div className="mt-20 grid grid-cols-3 gap-3">
        {data.map((item) => (
          <div
            key={item.name}
            className="rounded-2xl border border-white/[0.08] bg-black/20 px-3 py-3"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-zinc-500">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              {item.name}
            </div>
            <p className="mt-2 font-mono text-lg text-white">{item.value}</p>
          </div>
        ))}
      </div>
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

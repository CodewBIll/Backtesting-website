"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getTechniqueChartData } from "@/lib/utils";
import type { Trade } from "@/types/trade";

type TechniqueBarChartProps = {
  trades: Trade[];
};

export function TechniqueBarChart({ trades }: TechniqueBarChartProps) {
  const data = getTechniqueChartData(trades);

  if (!data.length) {
    return <ChartEmptyState label="Technique frequency will appear once trades are tagged." />;
  }

  return (
    <div className="h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 12, left: 12, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            dataKey="name"
            type="category"
            width={120}
            tick={{ fill: "#d4d4d8", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [`${Number(value ?? 0)} trades`, "Used in"]}
            contentStyle={{
              backgroundColor: "#111111",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "18px",
              color: "#f5f5f5",
            }}
          />
          <Bar dataKey="value" radius={[0, 10, 10, 0]} fill="#3b82f6" />
        </BarChart>
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

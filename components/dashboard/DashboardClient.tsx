"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import dynamic from "next/dynamic";

import {
  Activity,
  ChartColumn,
  CircleDollarSign,
  Ratio,
} from "lucide-react";

import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBanner } from "@/components/ui/StatusBanner";
import {
  cn,
  filterTradesByPeriod,
  formatPercent,
  formatPnL,
  formatRR,
  getPnLTone,
  getTradeStats,
} from "@/lib/utils";
import type { DashboardPeriod, Trade, TradeSourceResult } from "@/types/trade";

const PnLChart = dynamic(
  () => import("@/components/charts/PnLChart").then((module) => module.PnLChart),
  {
    ssr: false,
    loading: () => <ChartPlaceholder />,
  },
);

const WinRateChart = dynamic(
  () => import("@/components/charts/WinRateChart").then((module) => module.WinRateChart),
  {
    ssr: false,
    loading: () => <ChartPlaceholder />,
  },
);

const TechniqueBarChart = dynamic(
  () => import("@/components/charts/TechniqueBarChart").then((module) => module.TechniqueBarChart),
  {
    ssr: false,
    loading: () => <ChartPlaceholder />,
  },
);

const periodOptions: { value: DashboardPeriod; label: string }[] = [
  { value: "ALL", label: "All Time" },
  { value: "MONTH", label: "This Month" },
  { value: "WEEK", label: "Last 7 Days" },
];

type DashboardClientProps = TradeSourceResult;

export function DashboardClient({ trades, mode, errorMessage }: DashboardClientProps) {
  const [period, setPeriod] = useState<DashboardPeriod>("ALL");
  const filteredTrades = filterTradesByPeriod(trades, period);
  const stats = getTradeStats(filteredTrades);
  const pnlTone = getPnLTone(stats.totalPnl);

  return (
    <div className="space-y-8">
      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-[0_25px_100px_rgba(0,0,0,0.32)]">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-zinc-500">
            Private Control Board
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Trade with intent. Review without mercy.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            This board is here to keep you honest. Track the result, face the mistake, and earn
            the right to trust your process.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPeriod(option.value)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition",
                  period === option.value
                    ? "border-sky-400/30 bg-sky-400/[0.12] text-sky-100"
                    : "border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {mode === "demo" ? <StatusBanner mode="demo" /> : null}
          {mode === "error" ? <StatusBanner mode="error" message={errorMessage} /> : null}
          <MarketPulseCard trades={filteredTrades} />
        </div>
      </section>

      {filteredTrades.length ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Trade"
              value={String(stats.totalTrades)}
              hint="How many decisions you are accountable for"
              icon={<Activity className="h-5 w-5" />}
            />
            <StatCard
              label="Win Rate"
              value={formatPercent(stats.winRate)}
              hint="How often your plan survives contact"
              icon={<ChartColumn className="h-5 w-5" />}
              accent="neutral"
            />
            <StatCard
              label="Total PnL"
              value={formatPnL(stats.totalPnl)}
              hint="The total cost of your decisions"
              icon={<CircleDollarSign className="h-5 w-5" />}
              accent={pnlTone}
            />
            <StatCard
              label="Avg RR"
              value={formatRR(stats.avgRR)}
              hint="Average reward earned per unit of risk"
              icon={<Ratio className="h-5 w-5" />}
              accent="neutral"
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <ChartPanel
              eyebrow="Consistency"
              title="Cumulative PnL"
              description="Watch the equity curve and let the trend tell the truth."
            >
              <PnLChart trades={filteredTrades} />
            </ChartPanel>

            <div className="grid gap-5">
              <ChartPanel
                eyebrow="Outcome"
                title="Win / Loss / Breakeven"
                description="See how often discipline pays, fails, or stalls."
              >
                <WinRateChart trades={filteredTrades} />
              </ChartPanel>

              <ChartPanel
                eyebrow="Playbook"
                title="Trigger Frequency"
                description="Expose the triggers you keep leaning on."
              >
                <TechniqueBarChart trades={filteredTrades} />
              </ChartPanel>
            </div>
          </section>
        </>
      ) : (
        <EmptyState
          title="No trades. No excuses. Start the record."
          description="Log the first trade and give yourself something real to answer to."
        />
      )}
    </div>
  );
}

function ChartPanel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.32)]">
      <p className="font-mono text-xs uppercase tracking-[0.32em] text-zinc-500">{eyebrow}</p>
      <h2 className="mt-3 text-xl font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function MarketPulseCard({ trades }: { trades: Trade[] }) {
  if (!trades.length) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
        <p className="font-mono text-xs uppercase tracking-[0.32em] text-zinc-500">Daily Pressure</p>
        <div className="mt-5 rounded-[1.5rem] border border-white/[0.08] bg-black/20 p-5">
          <p className="font-mono text-sm uppercase tracking-[0.24em] text-zinc-500">Nothing Logged Yet</p>
          <p className="mt-3 text-sm leading-7 text-zinc-400">
            The board stays empty until you put real decisions on it.
          </p>
        </div>
      </div>
    );
  }

  const totalPnl = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const bestTrade = trades.reduce<Trade | null>((best, trade) => {
    if (!best || trade.pnl > best.pnl) {
      return trade;
    }
    return best;
  }, null);

  return (
    <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
      <p className="font-mono text-xs uppercase tracking-[0.32em] text-zinc-500">Daily Pressure</p>
      <div className="mt-5 space-y-5">
        <div>
          <p className="text-sm text-zinc-400">Current PnL</p>
          <p
            className={cn(
              "mt-2 font-mono text-3xl font-semibold",
              totalPnl > 0 && "text-emerald-300",
              totalPnl < 0 && "text-rose-300",
              totalPnl === 0 && "text-sky-300",
            )}
          >
            {formatPnL(totalPnl)}
          </p>
        </div>

        <div className="grid gap-3 rounded-[1.5rem] border border-white/[0.08] bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Best Execution</p>
          {bestTrade ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-lg text-white">{bestTrade.pair}</span>
                <span className="rounded-full bg-emerald-500/[0.15] px-3 py-1 text-xs text-emerald-300">
                  {bestTrade.result}
                </span>
              </div>
              <p className="text-sm leading-6 text-zinc-400">{bestTrade.reason}</p>
            </>
          ) : (
            <p className="text-sm leading-6 text-zinc-500">No trade data is available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ChartPlaceholder() {
  return (
    <div className="flex h-[320px] items-center justify-center rounded-[1.75rem] border border-dashed border-white/[0.08] bg-black/20 text-sm text-zinc-500">
      Loading the evidence...
    </div>
  );
}

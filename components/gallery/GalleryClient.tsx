"use client";

import { useState } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { TradeCard } from "@/components/ui/TradeCard";
import { TradeModal } from "@/components/ui/TradeModal";
import { cn } from "@/lib/utils";
import type { Trade, TradeResult, TradeSourceResult } from "@/types/trade";

type GalleryClientProps = TradeSourceResult;

type ResultFilter = "ALL" | TradeResult;

const resultFilters: ResultFilter[] = ["ALL", "WIN", "LOSS", "BREAKEVEN"];

export function GalleryClient({ trades, mode, errorMessage }: GalleryClientProps) {
  const [resultFilter, setResultFilter] = useState<ResultFilter>("ALL");
  const [pairFilter, setPairFilter] = useState("ALL");
  const [techniqueFilter, setTechniqueFilter] = useState("ALL");
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  const pairOptions = ["ALL", ...Array.from(new Set(trades.map((trade) => trade.pair)))];
  const techniqueOptions = [
    "ALL",
    ...Array.from(new Set(trades.flatMap((trade) => trade.technical_analysis).sort())),
  ];

  const filteredTrades = trades.filter((trade) => {
    const matchesResult = resultFilter === "ALL" || trade.result === resultFilter;
    const matchesPair = pairFilter === "ALL" || trade.pair === pairFilter;
    const matchesTechnique =
      techniqueFilter === "ALL" || trade.technical_analysis.includes(techniqueFilter);

    return matchesResult && matchesPair && matchesTechnique;
  });

  return (
    <div className="space-y-8">
      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-[0_25px_100px_rgba(0,0,0,0.32)]">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-zinc-500">
            Evidence Room
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Keep the charts. Keep yourself accountable.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Every screenshot is a witness. Review the setup, compare the outcome, and stop
            rewriting the story after the fact.
          </p>
        </div>

        <div className="space-y-4">
          {mode === "demo" ? <StatusBanner mode="demo" /> : null}
          {mode === "error" ? <StatusBanner mode="error" message={errorMessage} /> : null}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-zinc-500">
              Evidence Count
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <MiniStat label="Visible" value={String(filteredTrades.length)} />
              <MiniStat label="Pairs" value={String(new Set(trades.map((trade) => trade.pair)).size)} />
              <MiniStat
                label="WIN"
                value={String(trades.filter((trade) => trade.result === "WIN").length)}
              />
              <MiniStat
                label="LOSS"
                value={String(trades.filter((trade) => trade.result === "LOSS").length)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
        <div className="flex flex-wrap gap-3">
          {resultFilters.map((result) => (
            <button
              key={result}
              type="button"
              onClick={() => setResultFilter(result)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition",
                  resultFilter === result
                    ? "border-sky-400/30 bg-sky-400/[0.12] text-sky-100"
                    : "border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white",
                )}
            >
              {result}
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-2 text-sm text-zinc-400">
            Pair
            <select
              value={pairFilter}
              onChange={(event) => setPairFilter(event.target.value)}
              className="h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition focus:border-sky-400/50"
            >
              {pairOptions.map((pair) => (
                <option key={pair} value={pair}>
                  {pair}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-zinc-400">
            Trigger
            <select
              value={techniqueFilter}
              onChange={(event) => setTechniqueFilter(event.target.value)}
              className="h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition focus:border-sky-400/50"
            >
              {techniqueOptions.map((technique) => (
                <option key={technique} value={technique}>
                  {technique}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {filteredTrades.length ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredTrades.map((trade) => (
            <TradeCard key={trade.id} trade={trade} onSelect={setSelectedTrade} />
          ))}
        </section>
      ) : (
        <EmptyState
          title="No screenshots match the current filter."
          description="Change the filter or upload the chart next time. No evidence means no clean review."
        />
      )}

      <TradeModal trade={selectedTrade} onClose={() => setSelectedTrade(null)} />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.35rem] border border-white/[0.08] bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{label}</p>
      <p className="mt-2 font-mono text-2xl text-white">{value}</p>
    </div>
  );
}

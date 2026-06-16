"use client";
/* eslint-disable @next/next/no-img-element */

import { ArrowUpRight, CalendarDays } from "lucide-react";

import { cn, formatPnL, formatTradeDate, getPnLTone } from "@/lib/utils";
import type { Trade } from "@/types/trade";

type TradeCardProps = {
  trade: Trade;
  onSelect: (trade: Trade) => void;
};

export function TradeCard({ trade, onSelect }: TradeCardProps) {
  const pnlTone = getPnLTone(trade.pnl);

  return (
    <button
      type="button"
      onClick={() => onSelect(trade)}
      className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03] text-left shadow-[0_20px_80px_rgba(0,0,0,0.28)] transition hover:-translate-y-1 hover:border-white/20"
    >
      <div className="aspect-[4/3] overflow-hidden bg-black/30">
        {trade.screenshot_url ? (
          <img
            src={trade.screenshot_url}
            alt={`${trade.pair} screenshot`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            No screenshot
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent px-5 pb-5 pt-12">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.24em]",
                trade.result === "WIN" && "bg-emerald-500/[0.18] text-emerald-300",
                trade.result === "LOSS" && "bg-rose-500/[0.18] text-rose-300",
                trade.result === "BREAKEVEN" && "bg-sky-500/[0.18] text-sky-300",
              )}
            >
              {trade.result}
            </span>
            <h3 className="mt-3 font-mono text-xl font-semibold text-white">{trade.pair}</h3>
          </div>

          <div className="rounded-full border border-white/10 bg-white/10 p-2 text-white/75 transition group-hover:text-white">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2 text-zinc-400">
            <CalendarDays className="h-4 w-4" />
            {formatTradeDate(trade.trade_date)}
          </div>
          <div
            className={cn(
              "font-mono text-base font-semibold",
              pnlTone === "profit" && "text-emerald-300",
              pnlTone === "loss" && "text-rose-300",
              pnlTone === "neutral" && "text-sky-300",
            )}
          >
            {formatPnL(trade.pnl)}
          </div>
        </div>
      </div>
    </button>
  );
}

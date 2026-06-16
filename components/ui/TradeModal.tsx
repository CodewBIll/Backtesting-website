"use client";
/* eslint-disable @next/next/no-img-element */

import type { ReactNode } from "react";
import { useEffect } from "react";

import {
  ArrowUpDown,
  CalendarDays,
  FileText,
  Landmark,
  Scale,
  X,
} from "lucide-react";

import { cn, formatPnL, formatPrice, formatRR, formatTradeDate, getPnLTone } from "@/lib/utils";
import type { Trade } from "@/types/trade";

type TradeModalProps = {
  trade: Trade | null;
  onClose: () => void;
};

export function TradeModal({ trade, onClose }: TradeModalProps) {
  useEffect(() => {
    if (!trade) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [trade, onClose]);

  if (!trade) {
    return null;
  }

  const pnlTone = getPnLTone(trade.pnl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-5xl animate-modal-in overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c0c0d] shadow-[0_40px_120px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-zinc-500">
              Trade Record
            </p>
            <h3 className="mt-2 font-mono text-2xl font-semibold text-white">{trade.pair}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/[0.04] p-2 text-zinc-300 transition hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.25fr_0.95fr]">
          <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20">
            {trade.screenshot_url ? (
              <img
                src={trade.screenshot_url}
                alt={`${trade.pair} chart`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex min-h-[360px] items-center justify-center text-sm text-zinc-500">
                No screenshot available.
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Trade Date"
                  value={formatTradeDate(trade.trade_date)}
                />
                <DetailItem
                  icon={<ArrowUpDown className="h-4 w-4" />}
                  label="Direction"
                  value={trade.direction}
                />
                <DetailItem
                  icon={<Landmark className="h-4 w-4" />}
                  label="PnL"
                  value={formatPnL(trade.pnl)}
                  valueClassName={cn(
                    pnlTone === "profit" && "text-emerald-300",
                    pnlTone === "loss" && "text-rose-300",
                    pnlTone === "neutral" && "text-sky-300",
                  )}
                />
                <DetailItem
                  icon={<Scale className="h-4 w-4" />}
                  label="Risk Reward"
                  value={formatRR(trade.rr)}
                />
              </div>

              <div className="mt-5 grid gap-3 rounded-[1.25rem] border border-white/[0.08] bg-black/20 p-4 sm:grid-cols-2">
                <PriceDetail label="Entry" value={formatPrice(trade.entry_price)} />
                <PriceDetail label="Exit" value={formatPrice(trade.exit_price)} />
                <PriceDetail label="Stop Loss" value={formatPrice(trade.stop_loss)} />
                <PriceDetail label="Take Profit" value={formatPrice(trade.take_profit)} />
              </div>
            </div>

            <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm font-medium text-white">Trade Triggers</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {trade.technical_analysis.length ? (
                  trade.technical_analysis.map((technique) => (
                    <span
                      key={technique}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-200"
                    >
                      {technique}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-zinc-500">No trigger was tagged.</span>
                )}
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <FileText className="h-4 w-4" />
                Why You Took It
              </div>
              <p className="mt-3 text-sm leading-7 text-zinc-300">{trade.reason}</p>
              {trade.notes ? (
                <>
                  <div className="mt-5 h-px bg-white/10" />
                  <p className="mt-4 text-xs uppercase tracking-[0.28em] text-zinc-500">Notes</p>
                  <p className="mt-2 text-sm leading-7 text-zinc-400">{trade.notes}</p>
                </>
              ) : null}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

type DetailItemProps = {
  icon: ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
};

function DetailItem({ icon, label, value, valueClassName }: DetailItemProps) {
  return (
    <div className="rounded-[1.25rem] border border-white/[0.08] bg-black/20 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-zinc-500">
        {icon}
        {label}
      </div>
      <p className={cn("mt-3 font-mono text-lg text-white", valueClassName)}>{value}</p>
    </div>
  );
}

type PriceDetailProps = {
  label: string;
  value: string;
};

function PriceDetail({ label, value }: PriceDetailProps) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{label}</p>
      <p className="mt-1 font-mono text-base text-white">{value}</p>
    </div>
  );
}

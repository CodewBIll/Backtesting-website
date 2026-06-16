import { format, startOfDay, startOfMonth, subDays } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { DashboardPeriod, Direction, Trade, TradeResult } from "@/types/trade";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value);
}

export function formatPrice(value: number) {
  return formatNumber(value, 4);
}

export function formatPnL(value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";

  return `${sign}${formatNumber(Math.abs(value), 2)}`;
}

export function formatPercent(value: number) {
  return `${formatNumber(value, 1)}%`;
}

export function formatRR(value: number) {
  return `${formatNumber(value, 2)}R`;
}

export function formatTradeDate(value: string) {
  return format(new Date(value), "dd MMM yyyy");
}

export function formatChartDate(value: string) {
  return format(new Date(value), "dd MMM");
}

export function getPnLTone(value: number) {
  if (value > 0) {
    return "profit";
  }

  if (value < 0) {
    return "loss";
  }

  return "neutral";
}

export function getResultTone(result: TradeResult) {
  if (result === "WIN") {
    return "profit";
  }

  if (result === "LOSS") {
    return "loss";
  }

  return "neutral";
}

export function deriveTradeResultFromPnL(value: number): TradeResult {
  if (value > 0) {
    return "WIN";
  }

  if (value < 0) {
    return "LOSS";
  }

  return "BREAKEVEN";
}

export function normalizePnLForResult(value: number, result: TradeResult) {
  if (result === "WIN") {
    return Math.abs(value);
  }

  if (result === "LOSS") {
    return -Math.abs(value);
  }

  return 0;
}

export function calculateRR(
  entryPrice: number,
  stopLoss: number,
  takeProfit: number,
  direction: Direction,
) {
  const risk = direction === "LONG" ? entryPrice - stopLoss : stopLoss - entryPrice;
  const reward = direction === "LONG" ? takeProfit - entryPrice : entryPrice - takeProfit;

  if (risk <= 0 || reward <= 0) {
    return null;
  }

  return Number((reward / risk).toFixed(2));
}

export function calculatePnL(entryPrice: number, exitPrice: number, direction: Direction) {
  const rawPnL = direction === "LONG" ? exitPrice - entryPrice : entryPrice - exitPrice;

  return Number(rawPnL.toFixed(2));
}

export function filterTradesByPeriod(trades: Trade[], period: DashboardPeriod) {
  if (period === "ALL") {
    return trades;
  }

  const today = startOfDay(new Date());
  const cutoff = period === "MONTH" ? startOfMonth(today) : subDays(today, 6);

  return trades.filter((trade) => {
    const tradeDate = startOfDay(new Date(trade.trade_date));
    return tradeDate >= cutoff && tradeDate <= today;
  });
}

export function getTradeStats(trades: Trade[]) {
  const totalTrades = trades.length;
  const wins = trades.filter((trade) => trade.result === "WIN").length;
  const losses = trades.filter((trade) => trade.result === "LOSS").length;
  const breakeven = trades.filter((trade) => trade.result === "BREAKEVEN").length;
  const totalPnl = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const avgRR = totalTrades
    ? trades.reduce((sum, trade) => sum + trade.rr, 0) / totalTrades
    : 0;

  return {
    totalTrades,
    wins,
    losses,
    breakeven,
    totalPnl,
    avgRR,
    winRate: totalTrades ? (wins / totalTrades) * 100 : 0,
  };
}

export function getWinRateChartData(trades: Trade[]) {
  const stats = getTradeStats(trades);

  return [
    { name: "WIN", value: stats.wins, fill: "#22c55e" },
    { name: "LOSS", value: stats.losses, fill: "#ef4444" },
    { name: "BREAKEVEN", value: stats.breakeven, fill: "#3b82f6" },
  ].filter((item) => item.value > 0);
}

export function getCumulativePnLData(trades: Trade[]) {
  const sortedTrades = [...trades].sort((left, right) =>
    left.trade_date.localeCompare(right.trade_date),
  );

  let cumulativePnL = 0;

  return sortedTrades.map((trade) => {
    cumulativePnL += trade.pnl;

    return {
      date: trade.trade_date,
      label: formatChartDate(trade.trade_date),
      pnl: trade.pnl,
      cumulativePnL: Number(cumulativePnL.toFixed(2)),
    };
  });
}

export function getTechniqueChartData(trades: Trade[]) {
  const usageMap = new Map<string, number>();

  for (const trade of trades) {
    for (const technique of trade.technical_analysis) {
      usageMap.set(technique, (usageMap.get(technique) ?? 0) + 1);
    }
  }

  return Array.from(usageMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 8);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function toOptionalString(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

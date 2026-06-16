import { unstable_noStore as noStore } from "next/cache";

import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { normalizePnLForResult } from "@/lib/utils";
import type { Trade, TradeSourceResult } from "@/types/trade";

function normalizeNumber(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = Number(value);
    return Number.isFinite(normalized) ? normalized : 0;
  }

  return 0;
}

function normalizeTrade(trade: Trade): Trade {
  return {
    ...trade,
    entry_price: normalizeNumber(trade.entry_price),
    exit_price: normalizeNumber(trade.exit_price),
    stop_loss: normalizeNumber(trade.stop_loss),
    take_profit: normalizeNumber(trade.take_profit),
    pnl: normalizePnLForResult(normalizeNumber(trade.pnl), trade.result),
    rr: normalizeNumber(trade.rr),
    technical_analysis: trade.technical_analysis ?? [],
    screenshot_url: trade.screenshot_url ?? null,
    notes: trade.notes ?? null,
  };
}

export async function getTrades(options?: { screenshotsOnly?: boolean }): Promise<TradeSourceResult> {
  noStore();

  const screenshotsOnly = options?.screenshotsOnly ?? false;

  if (!isSupabaseConfigured) {
    return {
      trades: [],
      mode: "demo",
    };
  }

  try {
    const supabase = createServerSupabaseClient();
    let query = supabase.from("trades").select("*").order("trade_date", { ascending: false });

    if (screenshotsOnly) {
      query = query.not("screenshot_url", "is", null).neq("screenshot_url", "");
    }

    const { data, error } = await query;

    if (error) {
      return {
        trades: [],
        mode: "error",
        errorMessage: error.message,
      };
    }

    return {
      trades: (data ?? []).map((trade) => normalizeTrade(trade as Trade)),
      mode: "live",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Supabase error";

    return {
      trades: [],
      mode: "error",
      errorMessage: message,
    };
  }
}

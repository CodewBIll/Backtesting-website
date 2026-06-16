export const directions = ["LONG", "SHORT"] as const;
export const tradeResults = ["WIN", "LOSS", "BREAKEVEN"] as const;
export const dashboardPeriods = ["ALL", "MONTH", "WEEK"] as const;

export type Direction = (typeof directions)[number];
export type TradeResult = (typeof tradeResults)[number];
export type DashboardPeriod = (typeof dashboardPeriods)[number];

export const TECHNIQUE_OPTIONS = [
  "Candlestick Pattern",
  "Momentum",
  "Liquidity Sweep",
  "CRT",
  "Support/Resistance",
  "Market Structure Shift",
  "Break of Structure",
  "Change of Character",
  "Fair Value Gap",
  "Order Block",
  "Rejection from Key Level",
  "Session Sweep",
  "Imbalance Fill",
] as const;

export type TechniqueOption = (typeof TECHNIQUE_OPTIONS)[number];

export interface Trade {
  id: string;
  created_at: string;
  trade_date: string;
  pair: string;
  direction: Direction;
  entry_price: number;
  exit_price: number;
  stop_loss: number;
  take_profit: number;
  pnl: number;
  rr: number;
  result: TradeResult;
  technical_analysis: string[];
  reason: string;
  screenshot_url: string | null;
  notes: string | null;
}

export interface TradeInsert {
  trade_date: string;
  pair: string;
  direction: Direction;
  entry_price: number;
  exit_price: number;
  stop_loss: number;
  take_profit: number;
  pnl: number;
  rr: number;
  result: TradeResult;
  technical_analysis: string[];
  reason: string;
  screenshot_url?: string | null;
  notes?: string | null;
}

export interface Database {
  public: {
    Tables: {
      trades: {
        Row: Trade;
        Insert: TradeInsert;
        Update: Partial<TradeInsert>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

export interface TradeSourceResult {
  trades: Trade[];
  mode: "live" | "demo" | "error";
  errorMessage?: string;
}

import { AlertTriangle, Database, Radar } from "lucide-react";

import { cn } from "@/lib/utils";

type StatusBannerProps = {
  mode: "demo" | "error";
  message?: string;
};

export function StatusBanner({ mode, message }: StatusBannerProps) {
  const isDemo = mode === "demo";
  const Icon = isDemo ? Radar : AlertTriangle;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-[0_12px_40px_rgba(0,0,0,0.24)]",
        isDemo
          ? "border-sky-400/20 bg-sky-400/[0.08] text-sky-100"
          : "border-rose-400/20 bg-rose-400/[0.08] text-rose-100",
      )}
    >
      <div
        className={cn(
          "mt-0.5 rounded-full p-2",
          isDemo ? "bg-sky-400/[0.12] text-sky-300" : "bg-rose-400/[0.12] text-rose-300",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 font-medium">
          <Database className="h-4 w-4" />
          {isDemo ? "No live data yet" : "Supabase needs attention"}
        </div>
        <p className="leading-6 text-current/80">
          {isDemo
            ? "The journal is empty on purpose. Connect Supabase and start logging real trades. Empty is honest."
            : message ??
              "Check the table, bucket, and policies before you trust any number on this screen."}
        </p>
      </div>
    </div>
  );
}

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
  accent?: "profit" | "loss" | "neutral";
};

const accentStyles = {
  profit: "from-emerald-500/[0.18] via-emerald-500/[0.08] to-transparent text-emerald-300",
  loss: "from-rose-500/[0.18] via-rose-500/[0.08] to-transparent text-rose-300",
  neutral: "from-sky-500/[0.18] via-sky-500/[0.08] to-transparent text-sky-300",
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "neutral",
}: StatCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-24 bg-gradient-to-br opacity-80 transition group-hover:opacity-100",
          accentStyles[accent],
        )}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-400">{label}</p>
          <p className="mt-4 font-mono text-4xl font-semibold tracking-tight text-white">{value}</p>
          <p className="mt-2 text-sm text-zinc-500">{hint}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-white/80">
          {icon}
        </div>
      </div>
    </article>
  );
}

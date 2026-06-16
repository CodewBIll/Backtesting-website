import { PenSquare } from "lucide-react";

import { AddTradeForm } from "@/components/forms/AddTradeForm";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function AddTradePage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-[0_25px_100px_rgba(0,0,0,0.32)]">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-zinc-500">Private Record</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Log it now. Future you is not allowed to forget.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Record the setup, the chart, and the reason while the memory is still honest. The
            cleaner the input, the harder it is to lie during review.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-white/80">
              <PenSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.32em] text-zinc-500">Self Command</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Before You Lock It In</h2>
            </div>
          </div>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-zinc-400">
            <li>Match the pair and direction to the chart. No lazy mismatches.</li>
            <li>Write the reason like a trader with rules, not a storyteller with excuses.</li>
            <li>Tag every trigger you used so the dashboard can expose your habits.</li>
            <li>If you use live mode, keep the <span className="font-mono text-white">trade-screenshots</span> bucket public-read so the evidence stays visible.</li>
          </ul>
        </div>
      </section>

      <AddTradeForm isConfigured={isSupabaseConfigured} />
    </div>
  );
}

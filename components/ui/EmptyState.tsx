import Link from "next/link";

import { ArrowRight } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function EmptyState({
  title,
  description,
  ctaLabel = "Log The First Trade",
  ctaHref = "/add-trade",
}: EmptyStateProps) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] px-8 py-14 text-center shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-sky-400/70">Face The Blank</p>
      <h3 className="mt-4 text-2xl font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-zinc-400">{description}</p>
      <Link
        href={ctaHref}
        className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-5 py-3 text-sm font-medium text-sky-200 transition hover:border-sky-300/60 hover:bg-sky-400/[0.15]"
      >
        {ctaLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

"use client";

import { AlertTriangle, RotateCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-xl rounded-[2rem] border border-rose-400/20 bg-rose-400/10 p-8 text-center shadow-[0_25px_100px_rgba(0,0,0,0.32)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-rose-400/20 bg-rose-400/[0.12] text-rose-200">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-2xl font-semibold text-white">Something broke while loading</h2>
        <p className="mt-3 text-sm leading-7 text-rose-100/80">
          {error.message || "Reset the page, stay calm, and get back to the work."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.15]"
        >
          <RotateCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}

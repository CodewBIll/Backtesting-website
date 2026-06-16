"use client";
/* eslint-disable @next/next/no-img-element */

import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { UploadCloud } from "lucide-react";

import { useToast } from "@/components/ui/ToastProvider";
import { createBrowserSupabaseClient, storageBucket } from "@/lib/supabase";
import {
  calculatePnL,
  calculateRR,
  cn,
  deriveTradeResultFromPnL,
  formatPnL,
  formatRR,
  getPnLTone,
  normalizePnLForResult,
  slugify,
  toOptionalString,
} from "@/lib/utils";
import {
  TECHNIQUE_OPTIONS,
  directions,
  tradeResults,
  type Direction,
  type TradeInsert,
  type TradeResult,
} from "@/types/trade";

type AddTradeFormProps = {
  isConfigured: boolean;
};

type FormState = {
  tradeDate: string;
  pair: string;
  direction: Direction;
  entryPrice: string;
  exitPrice: string;
  stopLoss: string;
  takeProfit: string;
  pnl: string;
  result: TradeResult;
  technicalAnalysis: string[];
  reason: string;
  notes: string;
  screenshotFile: File | null;
};

const initialFormState: FormState = {
  tradeDate: new Date().toISOString().slice(0, 10),
  pair: "",
  direction: "LONG",
  entryPrice: "",
  exitPrice: "",
  stopLoss: "",
  takeProfit: "",
  pnl: "",
  result: "WIN",
  technicalAnalysis: [],
  reason: "",
  notes: "",
  screenshotFile: null,
};

export function AddTradeForm({ isConfigured }: AddTradeFormProps) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [autoPnl, setAutoPnl] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const entryPrice = Number(form.entryPrice);
  const exitPrice = Number(form.exitPrice);
  const stopLoss = Number(form.stopLoss);
  const takeProfit = Number(form.takeProfit);

  const rrValue =
    Number.isFinite(entryPrice) &&
    Number.isFinite(stopLoss) &&
    Number.isFinite(takeProfit) &&
    form.entryPrice &&
    form.stopLoss &&
    form.takeProfit
      ? calculateRR(entryPrice, stopLoss, takeProfit, form.direction)
      : null;

  const calculatedPnL =
    Number.isFinite(entryPrice) &&
    Number.isFinite(exitPrice) &&
    form.entryPrice &&
    form.exitPrice
      ? calculatePnL(entryPrice, exitPrice, form.direction)
      : null;

  useEffect(() => {
    if (!autoPnl) {
      return;
    }

    setForm((current) => {
      const nextPnl = calculatedPnL !== null ? String(calculatedPnL) : "";
      const nextResult =
        calculatedPnL !== null ? deriveTradeResultFromPnL(calculatedPnL) : current.result;

      if (current.pnl === nextPnl && current.result === nextResult) {
        return current;
      }

      return {
        ...current,
        pnl: nextPnl,
        result: nextResult,
      };
    });
  }, [autoPnl, calculatedPnL]);

  useEffect(() => {
    if (!form.screenshotFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(form.screenshotFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [form.screenshotFile]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateForm({
      ...form,
      rrValue,
      autoPnl,
      calculatedPnL,
    });

    if (validationError) {
      pushToast({
        tone: "error",
        title: "Finish the record",
        description: validationError,
      });
      return;
    }

    if (!isConfigured) {
      pushToast({
        tone: "error",
        title: "Supabase is not ready",
        description:
          "Set up the env vars and storage first. You do not get to save until the journal is ready.",
      });
      return;
    }

    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      pushToast({
        tone: "error",
        title: "Supabase client could not start",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const rawPnlValue = Number(form.pnl);
      const normalizedPnl =
        autoPnl && calculatedPnL !== null
          ? calculatedPnL
          : normalizePnLForResult(rawPnlValue, form.result);
      const normalizedResult = deriveTradeResultFromPnL(normalizedPnl);

      let screenshotUrl: string | null = null;

      if (form.screenshotFile) {
        const extension = form.screenshotFile.name.split(".").pop() ?? "png";
        const filePath = `screenshots/${Date.now()}-${slugify(form.pair || "trade")}.${extension}`;
        const uploadResult = await supabase.storage
          .from(storageBucket)
          .upload(filePath, form.screenshotFile, {
            cacheControl: "3600",
            contentType: form.screenshotFile.type,
            upsert: false,
          });

        if (uploadResult.error) {
          throw new Error(uploadResult.error.message);
        }

        const publicUrlResult = supabase.storage.from(storageBucket).getPublicUrl(filePath);
        screenshotUrl = publicUrlResult.data.publicUrl;
      }

      const payload: TradeInsert = {
        trade_date: form.tradeDate,
        pair: form.pair.trim().toUpperCase(),
        direction: form.direction,
        entry_price: entryPrice,
        exit_price: exitPrice,
        stop_loss: stopLoss,
        take_profit: takeProfit,
        pnl: normalizedPnl,
        rr: rrValue ?? 0,
        result: normalizedResult,
        technical_analysis: form.technicalAnalysis,
        reason: form.reason.trim(),
        notes: toOptionalString(form.notes),
        screenshot_url: screenshotUrl,
      };

      const rows = [payload] as unknown as never[];
      const { error } = await supabase.from("trades").insert(rows);

      if (error) {
        throw new Error(error.message);
      }

      pushToast({
        tone: "success",
        title: "Trade locked in",
        description: "The record is saved. Review it later without excuses.",
      });

      setForm(initialFormState);
      setAutoPnl(true);
      router.push("/gallery");
      router.refresh();
    } catch (error) {
      pushToast({
        tone: "error",
        title: "Trade was not saved",
        description: error instanceof Error ? error.message : "An unknown error stopped the save.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleTechnique(value: string) {
    setForm((current) => {
      const exists = current.technicalAnalysis.includes(value);
      return {
        ...current,
        technicalAnalysis: exists
          ? current.technicalAnalysis.filter((item) => item !== value)
          : [...current.technicalAnalysis, value],
      };
    });
  }

  const rawPnlNumber = Number(form.pnl);
  const normalizedManualPnl =
    Number.isFinite(rawPnlNumber) && form.pnl.length
      ? normalizePnLForResult(rawPnlNumber, form.result)
      : null;
  const previewPnl = autoPnl ? calculatedPnL : normalizedManualPnl;
  const previewResult =
    previewPnl !== null ? deriveTradeResultFromPnL(previewPnl) : form.result;
  const pnlTone = previewPnl !== null ? getPnLTone(previewPnl) : "neutral";

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Trade Date" required>
              <input
                type="date"
                value={form.tradeDate}
                onChange={(event) => updateForm(setForm, "tradeDate", event.target.value)}
                className={inputClassName}
              />
            </Field>

            <Field label="Pair" required>
              <input
                type="text"
                placeholder="BTCUSDT"
                value={form.pair}
                onChange={(event) => updateForm(setForm, "pair", event.target.value)}
                className={inputClassName}
              />
            </Field>
          </div>

          <div className="mt-5">
            <p className="text-sm text-zinc-400">Direction</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {directions.map((direction) => (
                <button
                  key={direction}
                  type="button"
                  onClick={() => updateForm(setForm, "direction", direction)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm font-medium transition",
                    form.direction === direction
                      ? "border-sky-400/[0.35] bg-sky-400/[0.12] text-sky-100"
                      : "border-white/10 bg-black/20 text-zinc-300 hover:text-white",
                    )}
                >
                  {direction}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Entry Price" required>
              <input
                type="number"
                step="any"
                value={form.entryPrice}
                onChange={(event) => updateForm(setForm, "entryPrice", event.target.value)}
                className={inputClassName}
              />
            </Field>
            <Field label="Exit Price" required>
              <input
                type="number"
                step="any"
                value={form.exitPrice}
                onChange={(event) => updateForm(setForm, "exitPrice", event.target.value)}
                className={inputClassName}
              />
            </Field>
            <Field label="Stop Loss" required>
              <input
                type="number"
                step="any"
                value={form.stopLoss}
                onChange={(event) => updateForm(setForm, "stopLoss", event.target.value)}
                className={inputClassName}
              />
            </Field>
            <Field label="Take Profit" required>
              <input
                type="number"
                step="any"
                value={form.takeProfit}
                onChange={(event) => updateForm(setForm, "takeProfit", event.target.value)}
                className={inputClassName}
              />
            </Field>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field
              label="PnL"
              required
              hint="Auto-calculated from entry and exit. In manual mode, the sign follows the selected result."
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <span className="text-sm text-zinc-400">Auto calculate</span>
                  <button
                    type="button"
                    onClick={() => setAutoPnl((current) => !current)}
                    className={cn(
                      "relative inline-flex h-7 w-12 items-center rounded-full transition",
                      autoPnl ? "bg-sky-500/70" : "bg-white/10",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-5 w-5 rounded-full bg-white transition",
                        autoPnl ? "translate-x-6" : "translate-x-1",
                      )}
                    />
                  </button>
                </div>
                <input
                  type="number"
                  step="any"
                  value={form.pnl}
                  readOnly={autoPnl}
                  onChange={(event) => updateForm(setForm, "pnl", event.target.value)}
                  className={inputClassName}
                />
              </div>
            </Field>

            <Field label="RR" required hint="Calculated automatically from entry, stop, and target.">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="font-mono text-xl text-white">
                  {rrValue !== null ? formatRR(rrValue) : "Stand by"}
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  LONG uses (TP - Entry) / (Entry - SL). SHORT is adjusted automatically.
                </p>
              </div>
            </Field>
          </div>

          <div className="mt-5">
            <p className="text-sm text-zinc-400">Result</p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {tradeResults.map((result) => (
                <button
                  key={result}
                  type="button"
                  onClick={() => {
                    if (!autoPnl) {
                      updateForm(setForm, "result", result);
                    }
                  }}
                  disabled={autoPnl}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm font-medium transition",
                    previewResult === result
                      ? "border-sky-400/[0.35] bg-sky-400/[0.12] text-sky-100"
                      : "border-white/10 bg-black/20 text-zinc-300 hover:text-white",
                    autoPnl && "cursor-not-allowed opacity-70",
                    )}
                >
                  {result}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              {autoPnl
                ? "Result is synced automatically from the current PnL."
                : "Manual mode keeps the magnitude you enter, then applies the sign from the selected result."}
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
          <Field
            label="Trade Triggers"
            required
            hint="Tag the exact trigger set you traded from. No vague labels."
          >
            <div className="mt-4 flex flex-wrap gap-2">
              {TECHNIQUE_OPTIONS.map((technique) => {
                const isActive = form.technicalAnalysis.includes(technique);

                return (
                  <button
                    key={technique}
                    type="button"
                    onClick={() => toggleTechnique(technique)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm transition",
                      isActive
                        ? "border-emerald-400/[0.25] bg-emerald-400/[0.12] text-emerald-100"
                        : "border-white/10 bg-black/20 text-zinc-300 hover:text-white",
                    )}
                  >
                    {technique}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="mt-6 grid gap-4">
            <Field label="Reason" required>
              <textarea
                rows={5}
                value={form.reason}
                onChange={(event) => updateForm(setForm, "reason", event.target.value)}
                className={textareaClassName}
                placeholder="What did you see, what gave you permission, and why did you take it?"
              />
            </Field>

            <Field label="Notes" hint="Optional">
              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) => updateForm(setForm, "notes", event.target.value)}
                className={textareaClassName}
                placeholder="What did you miss, what did you learn, and what must not happen again?"
              />
            </Field>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
          <Field label="Screenshot Upload" hint="PNG/JPG/WEBP, max 5MB">
            <label className="mt-3 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-dashed border-white/[0.12] bg-black/20 px-6 py-10 text-center transition hover:border-sky-400/30">
              <div className="rounded-full border border-white/10 bg-white/[0.04] p-3 text-zinc-200">
                <UploadCloud className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-white">
                  {form.screenshotFile ? form.screenshotFile.name : "Upload the chart"}
                </p>
                <p className="mt-1 text-sm text-zinc-500">Drop the screenshot here. Keep the evidence.</p>
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    screenshotFile: event.target.files?.[0] ?? null,
                  }))
                }
              />
            </label>
          </Field>

          <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20">
            {previewUrl ? (
              <img src={previewUrl} alt="Screenshot preview" className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center text-sm text-zinc-500">
                Your evidence will appear here.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-zinc-500">Discipline Snapshot</p>
          <div className="mt-5 space-y-4">
            <SummaryRow label="Direction" value={form.direction} />
            <SummaryRow label="Result" value={previewResult} />
            <SummaryRow label="Triggers Tagged" value={String(form.technicalAnalysis.length)} />
            <SummaryRow
              label="PnL Preview"
              value={previewPnl !== null ? formatPnL(previewPnl) : "Stand by"}
              valueClassName={cn(
                pnlTone === "profit" && "text-emerald-300",
                pnlTone === "loss" && "text-rose-300",
                pnlTone === "neutral" && "text-sky-300",
              )}
            />
            <SummaryRow label="RR Preview" value={rrValue !== null ? formatRR(rrValue) : "Stand by"} />
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-zinc-400">
            {isConfigured ? (
              <p>
                Ready to upload the chart to <span className="font-mono text-white">{storageBucket}</span> and
                write the record into <span className="font-mono text-white">trades</span>.
              </p>
            ) : (
              <p>
                You can rehearse the form, but you do not get to save until Supabase is configured.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-sky-400/30 bg-sky-400/[0.12] px-5 py-3.5 text-sm font-medium text-sky-100 transition hover:border-sky-300/50 hover:bg-sky-400/[0.16] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Locking it in..." : "Save The Record"}
          </button>
        </section>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-center gap-2 text-sm text-zinc-300">
        <span>{label}</span>
        {required ? <span className="text-rose-300">*</span> : null}
      </div>
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
      <div className="mt-3">{children}</div>
    </label>
  );
}

function SummaryRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-white/[0.08] bg-black/20 px-4 py-3">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className={cn("font-mono text-base text-white", valueClassName)}>{value}</span>
    </div>
  );
}

function updateForm<K extends keyof FormState>(
  setForm: Dispatch<SetStateAction<FormState>>,
  key: K,
  value: FormState[K],
) {
  setForm((current) => ({
    ...current,
    [key]: value,
  }));
}

function validateForm(input: FormState & { rrValue: number | null; autoPnl: boolean; calculatedPnL: number | null }) {
  if (!input.tradeDate || !input.pair.trim() || !input.reason.trim()) {
    return "Trade date, pair, and reason are required. Write the record properly.";
  }

  const numericFields = [
    { label: "Entry Price", value: input.entryPrice },
    { label: "Exit Price", value: input.exitPrice },
    { label: "Stop Loss", value: input.stopLoss },
    { label: "Take Profit", value: input.takeProfit },
    { label: "PnL", value: input.pnl },
  ];

  for (const field of numericFields) {
    if (!field.value.length) {
      return `${field.label} is required. Fill it in.`;
    }

    if (!Number.isFinite(Number(field.value))) {
      return `${field.label} must be a valid number.`;
    }
  }

  if (input.technicalAnalysis.length === 0) {
    return "Select at least one technical trigger. Be honest about what you used.";
  }

  if (input.rrValue === null) {
    return "RR is invalid. Make sure entry, stop, and target match the trade direction.";
  }

  if (input.screenshotFile && input.screenshotFile.size > 5 * 1024 * 1024) {
    return "Screenshot size must stay under 5MB.";
  }

  return null;
}

const inputClassName =
  "h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-sky-400/50";

const textareaClassName =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-sky-400/50";

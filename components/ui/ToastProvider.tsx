"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";

type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
};

type Toast = ToastInput & {
  id: number;
  tone: ToastTone;
};

type ToastContextValue = {
  pushToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const value: ToastContextValue = {
    pushToast: (toast) => {
      const nextToast: Toast = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        tone: toast.tone ?? "info",
        title: toast.title,
        description: toast.description,
      };

      setToasts((current) => [...current, nextToast]);

      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== nextToast.id));
      }, 3600);
    },
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-20 z-[60] mx-auto flex w-full max-w-md flex-col gap-3 px-4">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}

function ToastCard({ toast }: { toast: Toast }) {
  const icon =
    toast.tone === "success" ? (
      <CheckCircle2 className="h-5 w-5" />
    ) : toast.tone === "error" ? (
      <AlertTriangle className="h-5 w-5" />
    ) : (
      <Info className="h-5 w-5" />
    );

  return (
    <div
      className={cn(
        "pointer-events-auto rounded-2xl border px-4 py-3 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl",
        toast.tone === "success" && "border-emerald-400/20 bg-emerald-400/10 text-emerald-50",
        toast.tone === "error" && "border-rose-400/20 bg-rose-400/10 text-rose-50",
        toast.tone === "info" && "border-sky-400/20 bg-sky-400/10 text-sky-50",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div>
          <p className="font-medium">{toast.title}</p>
          {toast.description ? (
            <p className="mt-1 text-sm leading-6 text-current/80">{toast.description}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

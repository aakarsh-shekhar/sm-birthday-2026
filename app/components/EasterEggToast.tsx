"use client";

import { useEffect } from "react";

import { EASTER_EGG_KEYS } from "@/lib/easter-eggs";

export type EasterEggToastPayload = {
  count: number;
  line: string;
  /** When the latest find completes the full egg set. */
  kind?: "default" | "season_finale";
  finaleLine?: string;
} | null;

type EasterEggToastProps = {
  toast: EasterEggToastPayload;
  onDismiss: () => void;
  durationMs?: number;
};

export function EasterEggToast({ toast, onDismiss, durationMs = 3800 }: EasterEggToastProps) {
  const finale = toast?.kind === "season_finale";
  const effectiveDuration = finale ? Math.max(durationMs, 5200) : durationMs;

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(onDismiss, effectiveDuration);
    return () => window.clearTimeout(id);
  }, [toast, onDismiss, effectiveDuration]);

  if (!toast) return null;

  const total = EASTER_EGG_KEYS.length;

  return (
    <>
      <div
        role="status"
        aria-live="polite"
        className="egg-toast-pop fixed inset-x-0 bottom-0 z-[100] flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <div className="max-w-md rounded-2xl border border-amber-400/45 bg-slate-950/96 px-6 py-4 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-300/95">
            {finale ? "Season finale" : "Easter egg found"}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-white">
            {toast.count}
            <span className="text-xl font-semibold text-slate-400">/{total}</span>
          </p>
          <p className="mt-2 text-sm leading-snug text-slate-100">{toast.line}</p>
          {finale && toast.finaleLine ? (
            <p className="mt-2 text-sm font-medium leading-snug text-amber-100/95">{toast.finaleLine}</p>
          ) : null}
          <button
            type="button"
            onClick={onDismiss}
            className="mt-3 text-xs font-medium text-amber-200/80 underline decoration-amber-400/40 underline-offset-2 hover:text-amber-100"
          >
            Dismiss
          </button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes egg-toast-in {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .egg-toast-pop {
          animation: egg-toast-in 0.42s ease-out both;
        }
      `}</style>
    </>
  );
}

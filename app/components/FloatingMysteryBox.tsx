"use client";

import { useCallback, useEffect, useState } from "react";

import { easterEggMysteryHint, type EasterEggKey } from "@/lib/easter-eggs";

function uniqEggs(keys: EasterEggKey[]): EasterEggKey[] {
  return [...new Set(keys)];
}

type FloatingMysteryBoxProps = {
  candidateEggs: EasterEggKey[];
  foundEggs?: EasterEggKey[];
  /** Guest flows are dark; admin shell is light. */
  theme?: "dark" | "light";
};

export function FloatingMysteryBox({
  candidateEggs,
  foundEggs = [],
  theme = "dark",
}: FloatingMysteryBoxProps) {
  const keys = uniqEggs(candidateEggs);
  const found = new Set(foundEggs);
  const unresolvedKeys = keys.filter((key) => !found.has(key));
  const [hintOpen, setHintOpen] = useState(false);
  const [hintText, setHintText] = useState("");

  const openHint = useCallback(() => {
    if (unresolvedKeys.length === 0) return;
    const pick = unresolvedKeys[Math.floor(Math.random() * unresolvedKeys.length)]!;
    setHintText(easterEggMysteryHint(pick));
    setHintOpen(true);
  }, [unresolvedKeys]);

  useEffect(() => {
    if (!hintOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHintOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hintOpen]);

  useEffect(() => {
    if (!hintOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [hintOpen]);

  useEffect(() => {
    if (unresolvedKeys.length === 0) {
      setHintOpen(false);
    }
  }, [unresolvedKeys.length]);

  if (unresolvedKeys.length === 0) return null;

  const btnClass =
    theme === "light"
      ? "border border-slate-400/30 bg-white/65 text-slate-500 shadow-none hover:border-slate-400/45 hover:bg-white/85 hover:text-slate-600"
      : "border border-white/12 bg-slate-950/40 text-amber-200/45 shadow-none hover:border-white/18 hover:bg-slate-950/55 hover:text-amber-200/75";

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-[120] overflow-hidden"
        aria-hidden={hintOpen}
      >
        <div className="mystery-wander-wrap pointer-events-auto opacity-55 transition-opacity hover:opacity-90">
          <button
            type="button"
            onClick={openHint}
            aria-label="Mystery box — tap for a cryptic hint"
            className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-amber-400/50 ${btnClass}`}
          >
            <span aria-hidden className="select-none">
              ?
            </span>
          </button>
        </div>
      </div>

      {hintOpen ? (
        <div
          className="fixed inset-0 z-[450] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="floating-mystery-hint-title"
          onClick={() => setHintOpen(false)}
        >
          <div
            className="relative z-10 w-full max-w-md rounded-2xl border border-white/20 bg-slate-900/95 p-6 text-center shadow-[0_24px_64px_rgba(0,0,0,0.55)]"
            onClick={(e) => e.stopPropagation()}
          >
            <p
              id="floating-mystery-hint-title"
              className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-300/95"
            >
              A whisper
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-100 sm:text-base">{hintText}</p>
            <button
              type="button"
              onClick={() => setHintOpen(false)}
              className="mt-6 rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-300"
            >
              Got it
            </button>
          </div>
        </div>
      ) : null}

      <style jsx global>{`
        /* Perimeter path only — avoids drifting through the middle of the screen. */
        .mystery-wander-wrap {
          position: fixed;
          left: 0;
          top: 0;
          width: 2.25rem;
          height: 2.25rem;
          animation: mystery-wander-edge 28s ease-in-out infinite;
          will-change: transform;
        }
        @keyframes mystery-wander-edge {
          0%,
          100% {
            transform: translate3d(max(0.75rem, env(safe-area-inset-left)), calc(100dvh - 2.25rem - max(0.75rem, env(safe-area-inset-bottom))), 0);
          }
          25% {
            transform: translate3d(calc(100vw - 2.25rem - max(0.75rem, env(safe-area-inset-right))), calc(100dvh - 2.25rem - max(0.75rem, env(safe-area-inset-bottom))), 0);
          }
          50% {
            transform: translate3d(calc(100vw - 2.25rem - max(0.75rem, env(safe-area-inset-right))), max(0.75rem, env(safe-area-inset-top)), 0);
          }
          75% {
            transform: translate3d(max(0.75rem, env(safe-area-inset-left)), max(0.75rem, env(safe-area-inset-top)), 0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .mystery-wander-wrap {
            animation: none;
            right: max(0.75rem, env(safe-area-inset-right));
            bottom: max(5.5rem, calc(env(safe-area-inset-bottom) + 3.5rem));
            left: auto;
            top: auto;
            transform: none;
          }
        }
      `}</style>
    </>
  );
}

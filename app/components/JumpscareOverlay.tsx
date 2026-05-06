"use client";

import Image from "next/image";
import { useEffect } from "react";

export type JumpscareVariant = "lane" | "rachna";

type Props = {
  variant: JumpscareVariant | null;
  onDismiss: () => void;
  /** If set, calls `onDismiss` after this many ms (tap still skips sooner). */
  autoDismissMs?: number;
};

const SOURCES: Record<JumpscareVariant, string> = {
  lane: "/jumpscares/lane-7.png",
  rachna: "/jumpscares/rachna-mami.png",
};

function playSting() {
  try {
    type AudioCtx = typeof AudioContext;
    const Ctor =
      typeof window !== "undefined"
        ? window.AudioContext || (window as unknown as { webkitAudioContext?: AudioCtx }).webkitAudioContext
        : undefined;
    if (!Ctor) return;
    const ctx = new Ctor();
    void ctx.resume().then(() => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(48, ctx.currentTime + 0.25);
      g.gain.setValueAtTime(0.0008, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.025);
      g.gain.exponentialRampToValueAtTime(0.0008, ctx.currentTime + 0.42);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.44);
      osc.onended = () => {
        void ctx.close();
      };
    });
  } catch {
    /* ignore */
  }
}

export function JumpscareOverlay({ variant, onDismiss, autoDismissMs }: Props) {
  useEffect(() => {
    if (!variant) return;
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reducedMotion) playSting();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [variant, onDismiss]);

  useEffect(() => {
    if (!variant || autoDismissMs == null) return;
    const id = window.setTimeout(() => onDismiss(), autoDismissMs);
    return () => window.clearTimeout(id);
  }, [variant, autoDismissMs, onDismiss]);

  if (!variant) return null;

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <>
      <style jsx global>{`
        @keyframes jumpscare-flash {
          0% {
            opacity: 0;
            filter: brightness(3);
          }
          18% {
            opacity: 1;
            filter: brightness(1.15);
          }
          100% {
            opacity: 1;
            filter: brightness(1);
          }
        }
        @keyframes jumpscare-shake {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          15% {
            transform: translate(-4px, 2px) scale(1.02);
          }
          30% {
            transform: translate(4px, -3px) scale(1.03);
          }
          45% {
            transform: translate(-3px, -2px) scale(1.02);
          }
          60% {
            transform: translate(3px, 3px) scale(1.02);
          }
        }
        @keyframes jumpscare-shout-pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.06);
          }
        }
      `}</style>
      <button
        type="button"
        aria-label="Close surprise"
        className="fixed inset-0 z-[5000] flex cursor-zoom-out flex-col items-center justify-center border-0 bg-black p-3 outline-none ring-0 sm:p-6"
        style={{
          animation: reducedMotion ? undefined : "jumpscare-flash 0.38s ease-out both",
        }}
        onClick={onDismiss}
      >
        <div
          className="relative h-[min(82vh,820px)] w-full max-w-[min(96vw,920px)] flex-1"
          style={{
            animation: reducedMotion ? undefined : "jumpscare-shake 0.55s ease-out 0.1s both",
          }}
        >
          <p
            className="pointer-events-none absolute left-1/2 top-2 z-10 w-[min(96vw,640px)] -translate-x-1/2 px-2 text-center font-black uppercase tracking-tight text-amber-300 drop-shadow-[0_0_12px_rgba(0,0,0,0.95)] sm:top-4"
            style={{
              fontSize: "clamp(1.75rem, 7vw, 3.25rem)",
              lineHeight: 1.05,
              textShadow:
                "0 0 2px #000, 0 2px 0 #000, 0 4px 12px rgba(0,0,0,0.85), 0 0 28px rgba(251,191,36,0.45)",
              animation: reducedMotion ? undefined : "jumpscare-shout-pulse 0.45s ease-in-out infinite",
            }}
            aria-hidden
          >
            Happy birthday, Sumeet!
          </p>
          <Image
            src={SOURCES[variant]}
            alt=""
            fill
            priority
            className="object-contain"
            sizes="(max-width: 920px) 96vw, 920px"
          />
        </div>
        <p className="mt-3 shrink-0 text-center text-xs font-medium text-white/70">
          {autoDismissMs != null ? "Tap to skip · continues automatically" : "Tap anywhere to close"}
        </p>
      </button>
    </>
  );
}

"use client";

import Image from "next/image";
import { Great_Vibes } from "next/font/google";
import { FormEvent, TouchEvent, useMemo, useState } from "react";

type Activity = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  imageUrl: string | null;
  activityUrl: string | null;
  includedInStay: boolean | null;
};

type Reaction = "PASS" | "LIKE" | "SUPERLIKE";

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
});

async function parseJsonSafe(response: Response) {
  const raw = await response.text();
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function cleanDescription(value: string | null) {
  if (!value) return null;
  return value
    .replace(/(?:^|\s)Best for[^.]*\.?/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function formatDescription(value: string | null) {
  const cleaned = cleanDescription(value);
  if (!cleaned) return { intro: null as string | null, facts: [] as string[] };

  const bulletParts = cleaned
    .split("•")
    .map((part) => part.trim())
    .filter(Boolean);

  if (bulletParts.length > 1) {
    return {
      intro: bulletParts[0],
      facts: bulletParts.slice(1),
    };
  }

  return { intro: cleaned, facts: [] };
}

function getHostFromUrl(url: string | null) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function normalizeImagePath(url: string | null) {
  if (!url || !url.trim()) return "/activity-images/default-activity.svg";
  return /^\/activity-images\/upload-/i.test(url)
    ? url
    : "/activity-images/default-activity.svg";
}

export default function Home() {
  const [name, setName] = useState("");
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [index, setIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchDelta, setTouchDelta] = useState({ x: 0, y: 0 });

  const currentActivity = activities[index];
  const total = activities.length;
  const isFinished = Boolean(participantId && !currentActivity);

  const progress = useMemo(() => {
    if (!total) return 0;
    return Math.round((index / total) * 100);
  }, [index, total]);

  async function startSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await parseJsonSafe(response);
      if (!response.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "Could not start session.",
        );
      }

      if (typeof data?.participantId !== "string" || !Array.isArray(data?.activities)) {
        throw new Error("Received an invalid response from the server.");
      }

      setParticipantId(data.participantId);
      setActivities(data.activities as Activity[]);
      setIndex(0);
    } catch (sessionError) {
      setError(
        sessionError instanceof Error ? sessionError.message : "Something went wrong.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function submitReaction(reaction: Reaction) {
    if (!participantId || !currentActivity) return;
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/swipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId,
          activityId: currentActivity.id,
          reaction,
        }),
      });

      const data = await parseJsonSafe(response);
      if (!response.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "Failed to save swipe.",
        );
      }

      setIndex((value) => value + 1);
    } catch (swipeError) {
      setError(swipeError instanceof Error ? swipeError.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  function onCardTouchStart(event: TouchEvent<HTMLDivElement>) {
    if (isLoading || !currentActivity) return;
    const touch = event.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  }

  function onCardTouchMove(event: TouchEvent<HTMLDivElement>) {
    if (!touchStart || isLoading || !currentActivity) return;
    const touch = event.touches[0];
    setTouchDelta({
      x: touch.clientX - touchStart.x,
      y: touch.clientY - touchStart.y,
    });
  }

  async function onCardTouchEnd() {
    if (!touchStart || isLoading || !currentActivity) {
      setTouchStart(null);
      setTouchDelta({ x: 0, y: 0 });
      return;
    }

    const absX = Math.abs(touchDelta.x);
    const absY = Math.abs(touchDelta.y);
    const threshold = 70;

    let reaction: Reaction | null = null;

    if (absX > absY && absX >= threshold) {
      reaction = touchDelta.x > 0 ? "LIKE" : "PASS";
    } else if (touchDelta.y < 0 && absY >= threshold) {
      reaction = "SUPERLIKE";
    }

    setTouchStart(null);
    setTouchDelta({ x: 0, y: 0 });

    if (reaction) {
      await submitReaction(reaction);
    }
  }

  const swipeHint =
    touchDelta.x > 20
      ? "Release to Like"
      : touchDelta.x < -20
        ? "Release to Pass"
        : touchDelta.y < -20
          ? "Release to Superlike"
          : "Swipe: left pass, right like, up superlike";
  const activityDescription = formatDescription(currentActivity?.description ?? null);
  const activityHost = getHostFromUrl(currentActivity?.activityUrl ?? null);
  const activityImageUrl = normalizeImagePath(currentActivity?.imageUrl ?? null);

  if (!participantId) {
    return (
      <main
        className="h-screen snap-y snap-mandatory overflow-y-auto bg-slate-950 text-slate-100"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.8), rgba(15,23,42,0.92)), url('/party-bg.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <section className="mx-auto flex min-h-screen w-full max-w-4xl snap-start flex-col justify-center px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            A Family Celebration Story
          </p>
          <h1 className={`mt-4 text-6xl leading-none text-amber-300 sm:text-7xl ${greatVibes.className}`}>
            Happy Birthday Sumeet
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-200">
            This is not just a trip plan. It is a birthday experience designed by the people who
            matter most. Scroll to begin your part in creating the perfect day.
          </p>
          <p className="mt-8 text-sm text-slate-300">Scroll down to continue ↓</p>
        </section>

        <section className="mx-auto flex min-h-screen w-full max-w-4xl snap-start flex-col justify-center px-6 py-16">
          <div className="rounded-3xl border border-white/15 bg-slate-900/60 p-7 shadow-xl backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
              The Vibe
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              Poolside energy, chill moments, and unforgettable laughs
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-200">
              From adrenaline slides to laid-back hangouts, everyone gets to vote so the final
              itinerary feels personal, balanced, and worthy of Sumeet Mama&apos;s birthday.
            </p>
          </div>
        </section>

        <section className="mx-auto flex min-h-screen w-full max-w-4xl snap-start flex-col justify-center px-6 py-16">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">Step 1</p>
              <p className="mt-2 text-sm text-slate-100">Enter your name.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">Step 2</p>
              <p className="mt-2 text-sm text-slate-100">Swipe through every activity.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">Step 3</p>
              <p className="mt-2 text-sm text-slate-100">We finalize the birthday plan.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto flex min-h-screen w-full max-w-2xl snap-start flex-col justify-center px-6 py-16">
          <form
            onSubmit={startSession}
            className="rounded-3xl border border-white/20 bg-slate-900/75 p-7 shadow-[0_20px_60px_rgba(2,6,23,0.55)] backdrop-blur"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
              Your turn
            </p>
            <h3 className="mt-2 text-2xl font-bold text-white">Enter your name and start voting</h3>
            <label className="mt-5 mb-2 block text-sm font-medium text-slate-100" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Aakarsh"
              className="w-full rounded-lg border border-white/20 bg-slate-950/60 px-3 py-2 text-slate-100 outline-none placeholder:text-slate-400 focus:border-amber-300"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="mt-5 w-full rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-50"
            >
              {isLoading ? "Starting..." : "Start activity voting"}
            </button>
            {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
          </form>
        </section>
      </main>
    );
  }

  if (isFinished) {
    const confettiPieces = Array.from({ length: 44 }, (_, idx) => ({
      left: `${(idx * 17) % 100}%`,
      delay: `${(idx % 9) * 0.17}s`,
      duration: `${2.2 + (idx % 5) * 0.35}s`,
      color: ["#fbbf24", "#38bdf8", "#f472b6", "#34d399", "#f97316"][idx % 5],
    }));

    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 text-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_55%)]" />
        <section className="relative z-10 w-full max-w-xl rounded-3xl border border-white/15 bg-slate-900/75 p-8 text-center shadow-[0_24px_80px_rgba(2,6,23,0.6)] backdrop-blur">
          <p className={`text-5xl text-amber-300 ${greatVibes.className}`}>Cheers!</p>
          <p className="mt-3 text-xl font-semibold">Your birthday votes are in.</p>
          <p className="mt-2 text-sm text-slate-300">
            Thanks {name.trim() || "there"} - your picks are now part of Sumeet Mama&apos;s final
            celebration plan.
          </p>
          <a
            href="/admin"
            className="mt-5 inline-block rounded-lg border border-amber-300/40 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-200"
          >
            Open admin dashboard
          </a>
        </section>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 overflow-hidden">
          {confettiPieces.map((piece, idx) => (
            <span
              key={`${piece.left}-${idx}`}
              className="absolute bottom-0 h-3 w-2 rounded-sm"
              style={{
                left: piece.left,
                backgroundColor: piece.color,
                animationName: "rise-confetti",
                animationDuration: piece.duration,
                animationDelay: piece.delay,
                animationIterationCount: "infinite",
                animationTimingFunction: "ease-out",
              }}
            />
          ))}
        </div>

        <style jsx global>{`
          @keyframes rise-confetti {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            100% {
              transform: translateY(-72vh) rotate(540deg);
              opacity: 0;
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-slate-950 text-slate-100"
      style={{
        backgroundImage:
          "linear-gradient(rgba(15,23,42,0.78), rgba(15,23,42,0.9)), url('/party-bg.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col px-4 pb-8 pt-6 sm:px-6">
        <header className="rounded-3xl border border-amber-300/25 bg-slate-900/65 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.45)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            Birthday Bash • Waterpark Edition
          </p>
          <h1 className={`mt-3 text-5xl leading-none text-amber-300 sm:text-6xl ${greatVibes.className}`}>
            Happy Birthday Sumeet
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-200 sm:text-base">
            Party vibes, poolside fun, and a perfectly planned day. Enter your name and start
            voting on activities - from chill lounge moments to full-on splash-and-cheers energy.
          </p>
          <div className="mt-5 grid gap-2 text-xs text-slate-100 sm:grid-cols-3 sm:text-sm">
            <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2">
              1) Enter your name
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2">
              2) Swipe all activities
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2">
              3) Birthday itinerary is locked
            </div>
          </div>
        </header>

        {currentActivity ? (
          <section className="mt-6 w-full rounded-2xl border border-white/15 bg-slate-900/70 p-6 shadow-lg">
            <p className="text-xs text-slate-300">
              {index + 1} / {total} activities
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-700">
              <div className="h-full bg-amber-300 transition-all" style={{ width: `${progress}%` }} />
            </div>

            <div
              className="mt-6 touch-pan-y select-none overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-[0_10px_30px_rgba(2,6,23,0.45)] transition-transform"
              onTouchStart={onCardTouchStart}
              onTouchMove={onCardTouchMove}
              onTouchEnd={onCardTouchEnd}
              style={{
                transform: `translate(${touchDelta.x * 0.18}px, ${touchDelta.y * 0.18}px)`,
              }}
            >
              {activityImageUrl ? (
                <div className="relative">
                  <Image
                    src={activityImageUrl}
                    alt={currentActivity.title}
                    width={900}
                    height={500}
                    unoptimized
                    className="h-48 w-full object-cover sm:h-56"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent" />
                </div>
              ) : (
                <div className="flex h-48 w-full items-center justify-center bg-slate-100 text-sm text-slate-500 sm:h-56">
                  Activity image unavailable
                </div>
              )}
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  {currentActivity.category ? (
                    <span className="rounded-full bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-100">
                      {currentActivity.category}
                    </span>
                  ) : null}
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      currentActivity.includedInStay
                        ? "bg-emerald-900/60 text-emerald-200"
                        : "bg-amber-900/60 text-amber-200"
                    }`}
                  >
                    {currentActivity.includedInStay ? "Included in stay" : "Paid activity"}
                  </span>
                </div>
                <h2 className="mt-3 text-2xl font-semibold text-slate-100">{currentActivity.title}</h2>
                {activityDescription.intro ? (
                  <p className="mt-2 leading-relaxed text-slate-300">{activityDescription.intro}</p>
                ) : null}
                {activityDescription.facts.length > 0 ? (
                  <ul className="mt-3 space-y-1.5 text-sm text-slate-300">
                    {activityDescription.facts.map((fact) => (
                      <li key={fact} className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-300" />
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3">
                  {currentActivity.activityUrl ? (
                    <a
                      href={currentActivity.activityUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex text-sm font-semibold text-amber-300 underline underline-offset-2"
                    >
                      Open official activity page
                    </a>
                  ) : (
                    <p className="text-sm font-semibold text-slate-400">Official activity page not available</p>
                  )}
                  {currentActivity.activityUrl ? (
                    <p className="mt-1 break-all text-xs text-slate-400">{currentActivity.activityUrl}</p>
                  ) : null}
                    {activityHost ? (
                      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Source: {activityHost}
                      </p>
                    ) : null}
                </div>
                <p className="mt-4 text-xs text-slate-400">{swipeHint}</p>
              </div>
            </div>

            <div className="mt-8 hidden grid-cols-3 gap-3 md:grid">
              <button
                onClick={() => submitReaction("PASS")}
                disabled={isLoading}
                className="rounded-lg border border-slate-500 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-50"
              >
                Pass
              </button>
              <button
                onClick={() => submitReaction("LIKE")}
                disabled={isLoading}
                className="rounded-lg border border-emerald-700 bg-emerald-900/50 px-3 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-900/70 disabled:opacity-50"
              >
                Like
              </button>
              <button
                onClick={() => submitReaction("SUPERLIKE")}
                disabled={isLoading}
                className="rounded-lg border border-amber-700 bg-amber-900/50 px-3 py-2 text-sm font-medium text-amber-200 hover:bg-amber-900/70 disabled:opacity-50"
              >
                Superlike
              </button>
            </div>
            <p className="mt-4 text-center text-xs text-slate-400 md:hidden">
              Mobile mode: swipe on the card to vote.
            </p>
          </section>
        ) : null}

        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

        <footer className="mt-8 border-t border-white/15 pt-4 text-center text-xs text-slate-400">
          Happy Birthday Sumeet • Pool, Party & Perfect Picks
        </footer>
      </div>
    </main>
  );
}

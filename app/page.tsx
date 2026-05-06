"use client";

import Image from "next/image";
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-2xl flex-col px-4 pb-8 pt-6 sm:px-6">
        <header className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">
            Center Parcs Het Heijderbos
          </p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Family Trip Swipe Planner</h1>
          <p className="mt-2 text-sm text-slate-600">
            Swipe left to pass, right to like, and up to superlike must-do picks.
          </p>
        </header>

        {!participantId ? (
          <form
            onSubmit={startSession}
            className="mt-6 w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <label className="mb-2 block text-sm font-medium" htmlFor="name">
              Your name
            </label>
            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Aakarsh"
              className="w-full rounded-lg border px-3 py-2 outline-none ring-0 focus:border-black"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-50"
            >
              {isLoading ? "Starting..." : "Start swiping"}
            </button>
          </form>
        ) : currentActivity ? (
          <section className="mt-6 w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs text-slate-500">
              {index + 1} / {total} activities
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full bg-slate-900 transition-all" style={{ width: `${progress}%` }} />
            </div>

            <div
              className="mt-6 touch-pan-y select-none overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition-transform"
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
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/50 via-slate-900/10 to-transparent" />
                </div>
              ) : (
                <div className="flex h-48 w-full items-center justify-center bg-slate-100 text-sm text-slate-500 sm:h-56">
                  Activity image unavailable
                </div>
              )}
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  {currentActivity.category ? (
                    <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {currentActivity.category}
                    </span>
                  ) : null}
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      currentActivity.includedInStay
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {currentActivity.includedInStay ? "Included in stay" : "Paid activity"}
                  </span>
                </div>
                <h2 className="mt-3 text-2xl font-semibold">{currentActivity.title}</h2>
                {activityDescription.intro ? (
                  <p className="mt-2 leading-relaxed text-slate-600">{activityDescription.intro}</p>
                ) : null}
                {activityDescription.facts.length > 0 ? (
                  <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                    {activityDescription.facts.map((fact) => (
                      <li key={fact} className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-slate-400" />
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  {currentActivity.activityUrl ? (
                    <a
                      href={currentActivity.activityUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex text-sm font-semibold text-sky-700 underline underline-offset-2"
                    >
                      Open official activity page
                    </a>
                  ) : (
                    <p className="text-sm font-semibold text-slate-500">Official activity page not available</p>
                  )}
                  {currentActivity.activityUrl ? (
                    <p className="mt-1 break-all text-xs text-slate-500">{currentActivity.activityUrl}</p>
                  ) : null}
                    {activityHost ? (
                      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                        Source: {activityHost}
                      </p>
                    ) : null}
                </div>
                <p className="mt-4 text-xs text-slate-500">{swipeHint}</p>
              </div>
            </div>

            <div className="mt-8 hidden grid-cols-3 gap-3 md:grid">
              <button
                onClick={() => submitReaction("PASS")}
                disabled={isLoading}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Pass
              </button>
              <button
                onClick={() => submitReaction("LIKE")}
                disabled={isLoading}
                className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
              >
                Like
              </button>
              <button
                onClick={() => submitReaction("SUPERLIKE")}
                disabled={isLoading}
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
              >
                Superlike
              </button>
            </div>
            <p className="mt-4 text-center text-xs text-slate-500 md:hidden">
              Mobile mode: swipe on the card to vote.
            </p>
          </section>
        ) : (
          <section className="mt-6 w-full rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="text-xl font-semibold">Done! Your votes are saved.</p>
            <p className="mt-2 text-sm text-neutral-600">
              Thanks {name.trim() || "there"} - your preferences are now in the planner.
            </p>
            <a href="/admin" className="mt-4 inline-block text-sm font-medium underline">
              Open admin dashboard
            </a>
          </section>
        )}

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <footer className="mt-8 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
          Plan smarter together • Het Heijderbos family trip
        </footer>
      </div>
    </main>
  );
}

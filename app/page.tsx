"use client";

import Image from "next/image";
import { Great_Vibes } from "next/font/google";
import {
  FormEvent,
  TouchEvent,
  type UIEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { EasterEggToast, type EasterEggToastPayload } from "@/app/components/EasterEggToast";
import { JumpscareOverlay, type JumpscareVariant } from "@/app/components/JumpscareOverlay";
import {
  flushPendingEasterEggs,
  getPendingEasterEggs,
  persistSessionParticipantId,
  queueEasterEgg,
  reportEasterEggToServer,
} from "@/lib/easter-egg-client";
import { EASTER_EGG_KEYS, type EasterEggKey, easterEggToastLine } from "@/lib/easter-eggs";

type Activity = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  imageUrl: string | null;
  activityUrl: string | null;
  includedInStay: boolean | null;
};

type FoodOption = {
  id: string;
  title: string;
  description: string | null;
  infoUrl: string | null;
};

type GroceryItem = {
  id: string;
  item: string;
  participant: { id: string; name: string };
};

type Reaction = "PASS" | "LIKE" | "SUPERLIKE";

type SessionEntryMode = "full" | "grocery_only";

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
});

/** Time guest must keep the quote bar in view (cumulative) on pre-name landing. */
const QUOTE_DWELL_MS = 10_000;

/** Full-screen interstitials advance on tap or after this delay (normal flow, not hidden triggers). */
const FLOW_JUMPSCARE_AUTO_MS = 1800;

/** One quote per full-screen landing section; bottom bar, centered, max 4 lines each. */
const LANDING_SCROLL_QUOTES = [
  "The heart of our crew,\nthe warmest welcome at every door,\nSumeet Mama—this weekend\nis written around you.",
  "A pause for the one we came to celebrate—\nthen we fold laughter, water,\nand every vote into one story.",
  "Three small steps, then you are in.\nYour picks become the route;\nyour voice ties the bow\non the birthday surprise.",
  "Almost there. Breathe once,\nadd your name, and jump in—\nyour seat is saved\nwhere the best stories start.",
] as const;

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
  const t = url.trim();
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  if (t.startsWith("/activity-images/")) return t;
  return "/activity-images/default-activity.svg";
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
  const [foodOptions, setFoodOptions] = useState<FoodOption[]>([]);
  const [selectedFoodOptionIds, setSelectedFoodOptionIds] = useState<string[]>([]);
  const [foodStepDone, setFoodStepDone] = useState(false);
  const [groceryStepDone, setGroceryStepDone] = useState(false);
  const [foodLoading, setFoodLoading] = useState(false);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [groceryItemInput, setGroceryItemInput] = useState("");
  const [groceryLoading, setGroceryLoading] = useState(false);
  const [foodLoadedOnce, setFoodLoadedOnce] = useState(false);
  const [groceryLoadedOnce, setGroceryLoadedOnce] = useState(false);
  const [enteredViaGroceryOnly, setEnteredViaGroceryOnly] = useState(false);
  const [jumpscare, setJumpscare] = useState<JumpscareVariant | null>(null);
  const flowLaneGroceryShortcutDoneRef = useRef(false);
  const flowRachnaDoneRef = useRef(false);
  const [landingQuoteIndex, setLandingQuoteIndex] = useState(0);
  const [landingQuoteVisible, setLandingQuoteVisible] = useState(false);
  const [landingQuoteDisplayIndex, setLandingQuoteDisplayIndex] = useState(0);
  const [landingQuoteFadeIn, setLandingQuoteFadeIn] = useState(true);
  const landingQuoteTargetRef = useRef(landingQuoteIndex);
  landingQuoteTargetRef.current = landingQuoteIndex;

  useEffect(() => {
    if (landingQuoteIndex === landingQuoteDisplayIndex) {
      setLandingQuoteFadeIn(true);
      return;
    }
    setLandingQuoteFadeIn(false);
    const delayMs = 420;
    const id = window.setTimeout(() => {
      setLandingQuoteDisplayIndex(landingQuoteTargetRef.current);
      requestAnimationFrame(() => setLandingQuoteFadeIn(true));
    }, delayMs);
    return () => window.clearTimeout(id);
  }, [landingQuoteIndex, landingQuoteDisplayIndex]);

  const [dogPortraitZoom, setDogPortraitZoom] = useState(false);
  const dogHotSpotLastTapRef = useRef(0);
  const sessionEggsReportedRef = useRef<Set<string>>(new Set());
  const foodTitleTapRef = useRef({ count: 0, at: 0 });
  const quoteDwellAccumRef = useRef(0);
  const quoteDwellDoneRef = useRef(false);
  const landingDeepDoneRef = useRef(false);
  const finishCelebrationEggRef = useRef(false);
  const swipeHalfwayEggRef = useRef(false);
  const [eggToast, setEggToast] = useState<EasterEggToastPayload>(null);

  const dismissEggToast = useCallback(() => setEggToast(null), []);

  const dismissJumpscare = useCallback(() => {
    setJumpscare((current) => {
      if (current === "lane" && enteredViaGroceryOnly && !flowRachnaDoneRef.current) {
        flowRachnaDoneRef.current = true;
        return "rachna";
      }
      return null;
    });
  }, [enteredViaGroceryOnly]);

  const recordEggFind = useCallback(
    async (key: EasterEggKey) => {
      const line = easterEggToastLine(key);
      if (!participantId) {
        if (!queueEasterEgg(key)) return;
        const n = getPendingEasterEggs().length;
        setEggToast({ count: n, line });
        return;
      }
      if (sessionEggsReportedRef.current.has(key)) return;
      const unique = await reportEasterEggToServer(participantId, key);
      if (unique != null) {
        sessionEggsReportedRef.current.add(key);
        setEggToast({ count: unique, line });
      }
    },
    [participantId],
  );

  function triggerDogPortraitEgg() {
    setDogPortraitZoom(true);
    window.setTimeout(() => setDogPortraitZoom(false), 720);
    void recordEggFind("dog_double_tap");
  }

  function onDogPortraitHotSpotActivate() {
    const now = Date.now();
    if (now - dogHotSpotLastTapRef.current < 450) {
      dogHotSpotLastTapRef.current = 0;
      triggerDogPortraitEgg();
    } else {
      dogHotSpotLastTapRef.current = now;
    }
  }

  function onFoodPicksTitleInteract() {
    const now = Date.now();
    if (now - foodTitleTapRef.current.at > 650) {
      foodTitleTapRef.current = { count: 0, at: now };
    }
    foodTitleTapRef.current.count += 1;
    foodTitleTapRef.current.at = now;
    if (foodTitleTapRef.current.count >= 3) {
      foodTitleTapRef.current.count = 0;
      void recordEggFind("food_title_triple");
    }
  }

  const currentActivity = activities[index];
  const total = activities.length;
  const isSwipingFinished = Boolean(participantId && !currentActivity);
  const isChoosingFood = isSwipingFinished && !foodStepDone;
  const isWritingGrocery = isSwipingFinished && foodStepDone && !groceryStepDone;
  const isFinished = isSwipingFinished && foodStepDone && groceryStepDone;

  const progress = useMemo(() => {
    if (!total) return 0;
    return Math.round((index / total) * 100);
  }, [index, total]);

  useEffect(() => {
    if (!isWritingGrocery || !enteredViaGroceryOnly || flowLaneGroceryShortcutDoneRef.current) return;
    flowLaneGroceryShortcutDoneRef.current = true;
    setJumpscare("lane");
  }, [isWritingGrocery, enteredViaGroceryOnly]);

  useEffect(() => {
    if (!isWritingGrocery || enteredViaGroceryOnly || flowRachnaDoneRef.current) return;
    flowRachnaDoneRef.current = true;
    setJumpscare("rachna");
  }, [isWritingGrocery, enteredViaGroceryOnly]);

  useEffect(() => {
    if (participantId) {
      persistSessionParticipantId(participantId);
    }
  }, [participantId]);

  useEffect(() => {
    if (participantId || quoteDwellDoneRef.current) return;
    if (!landingQuoteVisible) return;
    const tickMs = 500;
    const id = window.setInterval(() => {
      quoteDwellAccumRef.current += tickMs;
      if (quoteDwellAccumRef.current >= QUOTE_DWELL_MS && !quoteDwellDoneRef.current) {
        quoteDwellDoneRef.current = true;
        void recordEggFind("quote_dwell");
      }
    }, tickMs);
    return () => window.clearInterval(id);
  }, [landingQuoteVisible, participantId, recordEggFind]);

  useEffect(() => {
    if (!isFinished || finishCelebrationEggRef.current) return;
    finishCelebrationEggRef.current = true;
    void recordEggFind("finish_celebration");
  }, [isFinished, recordEggFind]);

  useEffect(() => {
    if (!participantId || total < 2 || swipeHalfwayEggRef.current) return;
    if (progress >= 50) {
      swipeHalfwayEggRef.current = true;
      void recordEggFind("swipe_halfway");
    }
  }, [progress, participantId, total, recordEggFind]);

  async function startSessionWithMode(mode: SessionEntryMode) {
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

      const activitiesList = data.activities as Activity[];
      const pendingBeforeFlush = getPendingEasterEggs();

      setParticipantId(data.participantId);
      setActivities(activitiesList);
      setEnteredViaGroceryOnly(mode === "grocery_only");
      if (mode === "grocery_only") {
        setIndex(activitiesList.length);
        setFoodStepDone(true);
      } else {
        setIndex(0);
        setFoodStepDone(false);
      }
      setGroceryStepDone(false);
      setSelectedFoodOptionIds([]);
      setGroceryItems([]);
      setGroceryItemInput("");
      setFoodLoadedOnce(false);
      setGroceryLoadedOnce(false);
      setJumpscare(null);
      flowLaneGroceryShortcutDoneRef.current = false;
      flowRachnaDoneRef.current = false;

      const finalUnique = await flushPendingEasterEggs(data.participantId);
      if (pendingBeforeFlush.length > 0 && finalUnique != null) {
        pendingBeforeFlush.forEach((eggKey) => {
          sessionEggsReportedRef.current.add(eggKey);
        });
        pendingBeforeFlush.forEach((eggKey, i) => {
          window.setTimeout(() => {
            setEggToast({
              count:
                i === pendingBeforeFlush.length - 1 ? finalUnique : Math.min(i + 1, EASTER_EGG_KEYS.length),
              line: easterEggToastLine(eggKey),
            });
          }, i * 950);
        });
      }
    } catch (sessionError) {
      setError(
        sessionError instanceof Error ? sessionError.message : "Something went wrong.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function startFullSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void startSessionWithMode("full");
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
    } else if (touchDelta.y > 0 && absY >= threshold && absY >= absX) {
      void recordEggFind("card_down_swipe");
    }

    setTouchStart(null);
    setTouchDelta({ x: 0, y: 0 });

    if (reaction) {
      await submitReaction(reaction);
    }
  }

  const loadFoodOptions = useCallback(async () => {
    if (!participantId) return;
    setFoodLoading(true);
    try {
      const response = await fetch(`/api/food-options?participantId=${encodeURIComponent(participantId)}`);
      const data = (await response.json()) as {
        options?: FoodOption[];
        selectedOptionIds?: string[];
        error?: string;
      };
      if (response.ok) {
        setFoodOptions(data.options ?? []);
        setSelectedFoodOptionIds(data.selectedOptionIds ?? []);
      } else {
        setError(data.error ?? "Could not load food options.");
      }
    } finally {
      setFoodLoading(false);
      setFoodLoadedOnce(true);
    }
  }, [participantId]);

  async function submitFoodSelections() {
    if (!participantId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/food-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId,
          optionIds: selectedFoodOptionIds,
        }),
      });
      const data = await parseJsonSafe(response);
      if (!response.ok) {
        throw new Error(typeof data?.error === "string" ? data.error : "Could not save food choices.");
      }
      setFoodStepDone(true);
    } catch (foodError) {
      setError(foodError instanceof Error ? foodError.message : "Could not save food choices.");
    } finally {
      setIsLoading(false);
    }
  }

  const loadGroceryItems = useCallback(async () => {
    if (!participantId) return;
    setGroceryLoading(true);
    try {
      const response = await fetch(
        `/api/grocery-items?participantId=${encodeURIComponent(participantId)}`,
      );
      const data = (await response.json()) as { items?: GroceryItem[] };
      if (response.ok) {
        setGroceryItems(data.items ?? []);
      } else {
        setError("Could not load grocery list.");
      }
    } finally {
      setGroceryLoading(false);
      setGroceryLoadedOnce(true);
    }
  }, [participantId]);

  async function addGroceryItem() {
    if (!participantId) return;
    const item = groceryItemInput.trim();
    if (!item) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/grocery-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId,
          item,
        }),
      });
      const data = await parseJsonSafe(response);
      if (!response.ok) {
        throw new Error(typeof data?.error === "string" ? data.error : "Could not add grocery item.");
      }
      if (item.toLowerCase() === "sparkles") {
        void recordEggFind("grocery_sparkles");
      }
      setGroceryItemInput("");
      await loadGroceryItems();
    } catch (groceryError) {
      setError(groceryError instanceof Error ? groceryError.message : "Could not add grocery item.");
    } finally {
      setIsLoading(false);
    }
  }

  function finishGroceryStep() {
    setGroceryStepDone(true);
  }

  useEffect(() => {
    if (isChoosingFood && foodOptions.length === 0 && !foodLoading && !foodLoadedOnce) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadFoodOptions();
    }
  }, [isChoosingFood, foodOptions.length, foodLoading, foodLoadedOnce, loadFoodOptions]);

  useEffect(() => {
    if (isWritingGrocery && groceryItems.length === 0 && !groceryLoading && !groceryLoadedOnce) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadGroceryItems();
    }
  }, [
    isWritingGrocery,
    groceryItems.length,
    groceryLoading,
    groceryLoadedOnce,
    loadGroceryItems,
  ]);

  const swipeHint =
    touchDelta.x > 20
      ? "Release to Like"
      : touchDelta.x < -20
        ? "Release to Pass"
        : touchDelta.y < -20
          ? "Release to Superlike"
          : "Swipe: left pass, right like, up superlike";

  const swipeStamp = useMemo(() => {
    if (!touchStart || isLoading || !currentActivity) {
      return { kind: null as "pass" | "like" | "superlike" | null, opacity: 0 };
    }
    const dx = touchDelta.x;
    const dy = touchDelta.y;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    const min = 16;
    if (ax < min && ay < min) {
      return { kind: null, opacity: 0 };
    }
    const fade = (v: number) => Math.min(1, Math.max(0, (v - min) / 88));

    if (ax >= ay) {
      if (dx > min) return { kind: "like" as const, opacity: fade(ax) };
      if (dx < -min) return { kind: "pass" as const, opacity: fade(ax) };
    } else if (dy < -min) {
      return { kind: "superlike" as const, opacity: fade(ay) };
    }
    return { kind: null, opacity: 0 };
  }, [touchDelta.x, touchDelta.y, touchStart, isLoading, currentActivity]);
  const activityDescription = formatDescription(currentActivity?.description ?? null);
  const activityHost = getHostFromUrl(currentActivity?.activityUrl ?? null);
  const activityImageUrl = normalizeImagePath(currentActivity?.imageUrl ?? null);

  function onLandingScroll(event: UIEvent<HTMLElement>) {
    const el = event.currentTarget;
    const viewH = el.clientHeight;
    const st = el.scrollTop;
    setLandingQuoteVisible(st > 40);
    const idx = Math.min(
      LANDING_SCROLL_QUOTES.length - 1,
      Math.max(0, Math.floor(st / viewH)),
    );
    setLandingQuoteIndex(idx);
    const sectionIdx = Math.floor(st / viewH);
    if (!landingDeepDoneRef.current && sectionIdx >= 3) {
      landingDeepDoneRef.current = true;
      void recordEggFind("landing_deep_scroll");
    }
  }

  if (!participantId) {
    return (
      <>
        <EasterEggToast toast={eggToast} onDismiss={dismissEggToast} />
        <main
        onScroll={onLandingScroll}
        className="relative h-screen snap-y snap-mandatory overflow-y-auto bg-slate-950 pb-36 text-slate-100"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.8), rgba(15,23,42,0.92)), url('/party-bg.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <section className="mx-auto flex min-h-screen w-full max-w-3xl snap-start flex-col items-center justify-center px-6 py-16 text-center">
          <button
            type="button"
            onClick={() => void recordEggFind("legacy_line")}
            className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200/95"
          >
            A legacy of celebration
          </button>
          <h1 className={`mt-5 text-6xl leading-[1.05] text-amber-300 sm:text-7xl ${greatVibes.className}`}>
            Happy Birthday Sumeet!
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-slate-200/95 sm:text-lg">
            A curated trip plan and a shared toast to someone who means the world to this crew.
            Scroll when you are ready to add your voice to the weekend.
          </p>
          <p className="mt-12 flex items-center justify-center gap-2 text-sm text-slate-400">
            <span className="inline-block h-px w-8 bg-amber-400/50" aria-hidden />
            <span>Scroll</span>
            <span className="text-amber-200/80" aria-hidden>
              ↓
            </span>
          </p>
        </section>

        <section className="mx-auto flex min-h-screen w-full max-w-lg snap-start flex-col items-center justify-center px-6 py-16">
          <p className="mb-8 text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-200/90">
            Guest of honour
          </p>
          <div className="relative w-full max-w-[320px]">
            <div className="absolute -inset-4 -z-10 rounded-[1.35rem] bg-gradient-to-br from-amber-500/18 via-transparent to-sky-500/10 blur-2xl" aria-hidden />
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-slate-900 shadow-[0_28px_56px_-12px_rgba(0,0,0,0.55)] ring-1 ring-white/12">
              <div
                className={`relative h-full w-full origin-[50%_85%] transition-transform duration-[720ms] ease-out ${
                  dogPortraitZoom ? "scale-[1.2]" : "scale-100"
                }`}
              >
                <div
                  className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-slate-950/35 via-transparent to-slate-950/10"
                  aria-hidden
                />
                <Image
                  src="/sumeet-mama-bday.png"
                  alt="Sumeet Mama"
                  fill
                  className="object-cover object-[center_72%]"
                  sizes="320px"
                  priority
                  unoptimized
                />
              </div>
              <button
                type="button"
                aria-label="Portrait detail"
                onClick={onDogPortraitHotSpotActivate}
                className="absolute bottom-0 left-1/2 z-20 h-[38%] w-[min(220px,70%)] max-w-[240px] -translate-x-1/2 cursor-zoom-in border-0 bg-transparent p-0"
              />
            </div>
          </div>
          <p className="mt-10 text-sm text-slate-400">Keep scrolling ↓</p>
        </section>

        <section className="mx-auto flex min-h-screen w-full max-w-4xl snap-start flex-col justify-center px-6 py-16">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">Step 1</p>
              <p className="mt-2 text-sm text-slate-100">Enter your name.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">Step 2</p>
              <p className="mt-2 text-sm text-slate-100">
                Swipe activities &amp; pick food — or head straight to the grocery list.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">Step 3</p>
              <p className="mt-2 text-sm text-slate-100">We finalize the birthday plan.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto flex min-h-screen w-full max-w-2xl snap-start flex-col justify-center px-6 py-16">
          <form
            onSubmit={startFullSession}
            className="rounded-3xl border border-white/20 bg-slate-900/75 p-7 shadow-[0_20px_60px_rgba(2,6,23,0.55)] backdrop-blur"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
              Your turn
            </p>
            <h3 className="mt-2 text-2xl font-bold text-white">Enter your name to join</h3>
            <p className="mt-2 text-sm text-slate-400">
              Vote on activities and food, or skip straight to the shared grocery list.
            </p>
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
              {isLoading ? "Starting..." : "Continue to activities & food"}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => void startSessionWithMode("grocery_only")}
              className="mt-3 w-full rounded-lg border border-white/25 bg-transparent px-4 py-2.5 text-sm font-semibold text-slate-100 hover:bg-white/10 disabled:opacity-50"
            >
              I only need the grocery list
            </button>
            {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
          </form>
        </section>

        <aside
          aria-live="polite"
          className={`fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-slate-950/92 backdrop-blur-md transition-opacity duration-500 ease-out ${
            landingQuoteVisible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          role="complementary"
        >
          <div
            className={`mx-auto max-w-md px-5 py-3 text-center transition-[opacity,transform] duration-[420ms] ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:duration-200 sm:max-w-lg sm:py-4 ${
              landingQuoteFadeIn
                ? "translate-y-0 opacity-100 motion-reduce:translate-y-0"
                : "translate-y-2 opacity-0 motion-reduce:translate-y-0"
            }`}
          >
            <p className="whitespace-pre-line text-sm leading-snug text-slate-100 sm:text-base sm:leading-relaxed">
              {LANDING_SCROLL_QUOTES[landingQuoteDisplayIndex]}
            </p>
          </div>
          <div
            className="h-[max(0.75rem,env(safe-area-inset-bottom))]"
            aria-hidden
          />
        </aside>
      </main>
      </>
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
      <>
        <EasterEggToast toast={eggToast} onDismiss={dismissEggToast} />
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
      </>
    );
  }

  if (isChoosingFood) {
    return (
      <>
        <EasterEggToast toast={eggToast} onDismiss={dismissEggToast} />
        <main className="flex min-h-screen items-start justify-center overflow-y-auto bg-slate-950 px-4 py-6 text-slate-100 sm:items-center sm:px-6 sm:py-10">
        <section className="w-full max-w-xl rounded-3xl border border-white/15 bg-slate-900/75 p-5 shadow-xl sm:p-7">
          <button
            type="button"
            onClick={onFoodPicksTitleInteract}
            className={`w-full cursor-default select-none text-left text-4xl text-amber-300 ${greatVibes.className}`}
          >
            Food Picks
          </button>
          <p className="mt-2 text-sm text-slate-300">
            Pick anything you would like during the celebration.
          </p>
          {foodLoading ? <p className="mt-4 text-sm text-slate-400">Loading options...</p> : null}
          <div className="mt-4 max-h-[50vh] space-y-3 overflow-y-auto pr-1">
            {foodOptions.map((option) => {
              const host = getHostFromUrl(option.infoUrl);
              const inputId = `food-opt-${option.id}`;
              return (
                <div
                  key={option.id}
                  className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 transition-colors hover:border-amber-400/25 hover:bg-white/[0.08]"
                >
                  <div className="flex gap-3">
                    <input
                      id={inputId}
                      type="checkbox"
                      className="mt-1 h-4 w-4 shrink-0 rounded border-slate-500 text-amber-400 focus:ring-amber-400/50"
                      checked={selectedFoodOptionIds.includes(option.id)}
                      onChange={(event) => {
                        setSelectedFoodOptionIds((prev) =>
                          event.target.checked
                            ? [...prev, option.id]
                            : prev.filter((id) => id !== option.id),
                        );
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <label htmlFor={inputId} className="cursor-pointer">
                        <span className="font-medium text-slate-100">{option.title}</span>
                        {option.description ? (
                          <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                            {option.description}
                          </p>
                        ) : null}
                      </label>
                      {option.infoUrl ? (
                        <a
                          href={option.infoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex text-sm font-medium text-amber-300/95 underline decoration-amber-400/40 underline-offset-2 hover:text-amber-200"
                        >
                          {host ? `View on ${host}` : "Open details"}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={submitFoodSelections}
            disabled={isLoading}
            className="mt-5 w-full rounded-lg bg-amber-400 px-4 py-2.5 font-semibold text-slate-950 disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Continue"}
          </button>
          {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
        </section>
      </main>
      </>
    );
  }

  if (isWritingGrocery) {
    return (
      <>
        <JumpscareOverlay
          variant={jumpscare}
          onDismiss={dismissJumpscare}
          autoDismissMs={FLOW_JUMPSCARE_AUTO_MS}
        />
        <EasterEggToast toast={eggToast} onDismiss={dismissEggToast} />
        <main className="flex min-h-screen items-start justify-center overflow-y-auto bg-slate-950 px-4 py-6 text-slate-100 sm:items-center sm:px-6 sm:py-10">
        <section className="w-full max-w-xl rounded-3xl border border-white/15 bg-slate-900/75 p-5 shadow-xl sm:p-7">
          <p className={`text-4xl text-amber-300 ${greatVibes.className}`}>Grocery List</p>
          <p className="mt-2 text-sm text-slate-300">
            See the shared list and add your own items one-by-one.
          </p>
          {enteredViaGroceryOnly ? (
            <p className="mt-2 text-xs text-sky-300/90">
              You skipped activity voting and food picks — add anything the group should grab.
            </p>
          ) : null}
          <div className="mt-4 max-h-[36vh] overflow-y-auto rounded-lg border border-white/15 bg-slate-950/50 p-3">
            {groceryLoading ? (
              <p className="text-sm text-slate-400">Loading list...</p>
            ) : groceryItems.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {groceryItems.map((entry) => (
                  <li key={entry.id} className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5">
                    <span className="font-medium text-slate-100">{entry.item}</span>
                    <span className="ml-2 text-xs text-slate-400">- {entry.participant.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No items yet. Add the first one.</p>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              value={groceryItemInput}
              onChange={(event) => setGroceryItemInput(event.target.value)}
              placeholder="Add item (e.g. Ice bags)"
              className="flex-1 rounded-lg border border-white/20 bg-slate-950/60 px-3 py-2 text-slate-100 outline-none placeholder:text-slate-400 focus:border-amber-300"
            />
            <button
              onClick={addGroceryItem}
              disabled={isLoading}
              className="rounded-lg bg-sky-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-50"
            >
              {isLoading ? "Adding..." : "Add"}
            </button>
          </div>
          <button
            onClick={finishGroceryStep}
            className="mt-5 w-full rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-950"
          >
            Finish
          </button>
          {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
        </section>
      </main>
      </>
    );
  }

  return (
    <>
      <EasterEggToast toast={eggToast} onDismiss={dismissEggToast} />
    <main
      className="fixed inset-0 flex h-[100dvh] flex-col overflow-hidden bg-slate-950 text-slate-100"
      style={{
        backgroundImage:
          "linear-gradient(rgba(15,23,42,0.78), rgba(15,23,42,0.9)), url('/party-bg.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col px-4 py-4 sm:px-6">
        {currentActivity ? (
          <section className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="shrink-0">
              <div className="flex items-center justify-between gap-3 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                <span>{index + 1} / {total}</span>
                <span className="truncate text-[10px] font-normal capitalize tracking-normal text-slate-500">
                  {name.trim()}
                </span>
              </div>
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="h-full bg-amber-300 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div
              className="relative flex min-h-0 flex-1 touch-pan-y select-none flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-900 shadow-[0_10px_30px_rgba(2,6,23,0.45)] transition-transform"
              onTouchStart={onCardTouchStart}
              onTouchMove={onCardTouchMove}
              onTouchEnd={onCardTouchEnd}
              onTouchCancel={() => {
                setTouchStart(null);
                setTouchDelta({ x: 0, y: 0 });
              }}
              style={{
                transform: `translate(${touchDelta.x * 0.18}px, ${touchDelta.y * 0.18}px) rotate(${touchDelta.x * 0.035}deg)`,
              }}
            >
              {swipeStamp.kind === "pass" ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-2 top-[22%] z-20 flex w-[46%] items-start justify-start sm:left-4 sm:top-1/4"
                  style={{ opacity: swipeStamp.opacity }}
                >
                  <span className="inline-block rotate-[-14deg] rounded-md border-[3px] border-rose-500/55 px-3 py-1.5 text-3xl font-black uppercase tracking-wide text-rose-100/95 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] sm:text-4xl">
                    Pass
                  </span>
                </div>
              ) : null}
              {swipeStamp.kind === "like" ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute right-2 top-[22%] z-20 flex w-[46%] items-start justify-end sm:right-4 sm:top-1/4"
                  style={{ opacity: swipeStamp.opacity }}
                >
                  <span className="inline-block rotate-[14deg] rounded-md border-[3px] border-emerald-500/55 px-3 py-1.5 text-3xl font-black uppercase tracking-wide text-emerald-100/95 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] sm:text-4xl">
                    Like
                  </span>
                </div>
              ) : null}
              {swipeStamp.kind === "superlike" ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-5 z-20 flex justify-center px-3 sm:top-7"
                  style={{ opacity: swipeStamp.opacity }}
                >
                  <div className="relative max-w-[92%] rounded-2xl border border-sky-400/60 bg-gradient-to-br from-sky-500/30 via-indigo-600/25 to-sky-400/30 px-5 py-3 text-center shadow-[0_0_40px_rgba(56,189,248,0.28)] ring-1 ring-sky-300/40 backdrop-blur-[2px]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-sky-100/90">
                      ★ super vote ★
                    </p>
                    <p className="mt-1 bg-gradient-to-r from-cyan-200 via-sky-100 to-indigo-200 bg-clip-text text-2xl font-black uppercase tracking-[0.12em] text-transparent drop-shadow-sm sm:text-3xl">
                      Spark pick
                    </p>
                    <p className="mt-0.5 text-[10px] font-medium text-sky-200/75">
                      Reserve your loudest yes
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="relative shrink-0">
                {activityImageUrl ? (
                  <>
                    <Image
                      src={activityImageUrl}
                      alt={currentActivity.title}
                      width={900}
                      height={500}
                      unoptimized
                      className="h-[min(38vh,14rem)] w-full object-cover sm:h-[min(36vh,15rem)]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />
                  </>
                ) : (
                  <div className="flex h-[min(38vh,14rem)] w-full items-center justify-center bg-slate-800 text-sm text-slate-500 sm:h-[min(36vh,15rem)]">
                    Activity image unavailable
                  </div>
                )}
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-5">
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
                <h2 className="mt-2 text-xl font-semibold leading-tight text-slate-100 sm:text-2xl">
                  {currentActivity.title}
                </h2>
                {activityDescription.intro ? (
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{activityDescription.intro}</p>
                ) : null}
                {activityDescription.facts.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-sm text-slate-300">
                    {activityDescription.facts.map((fact) => (
                      <li key={fact} className="flex items-start gap-2">
                        <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3">
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
                <p className="mt-3 text-[11px] text-slate-500">{swipeHint}</p>
              </div>
            </div>

            <div className="hidden shrink-0 grid-cols-3 gap-2 pb-[max(env(safe-area-inset-bottom),0.75rem)] md:grid sm:gap-3">
              <button
                type="button"
                onClick={() => submitReaction("PASS")}
                disabled={isLoading}
                className="rounded-xl border border-slate-500 bg-slate-800 py-3 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-50 sm:text-sm"
              >
                Pass
              </button>
              <button
                type="button"
                onClick={() => submitReaction("LIKE")}
                disabled={isLoading}
                className="rounded-xl border border-emerald-700 bg-emerald-900/50 py-3 text-xs font-semibold text-emerald-200 hover:bg-emerald-900/70 disabled:opacity-50 sm:text-sm"
              >
                Like
              </button>
              <button
                type="button"
                onClick={() => submitReaction("SUPERLIKE")}
                disabled={isLoading}
                className="rounded-xl border border-amber-700 bg-amber-900/50 py-3 text-xs font-semibold text-amber-200 hover:bg-amber-900/70 disabled:opacity-50 sm:text-sm"
              >
                Superlike
              </button>
            </div>
          </section>
        ) : null}

        {error ? (
          <p className="shrink-0 py-2 text-center text-sm text-red-300" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </main>
    </>
  );
}

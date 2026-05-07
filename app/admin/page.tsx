"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EasterEggToast, type EasterEggToastPayload } from "@/app/components/EasterEggToast";
import { getSessionParticipantId, reportEasterEggToServer } from "@/lib/easter-egg-client";
import { EASTER_EGG_KEYS, easterEggLabel, easterEggToastLine, isEasterEggKey } from "@/lib/easter-eggs";

import { CollapsibleSection } from "@/app/admin/CollapsibleSection";
import { FloatingMysteryBox } from "@/app/components/FloatingMysteryBox";
import type {
  DashboardActivity,
  DashboardFoodOption,
  DashboardGroceryItem,
  DashboardParticipant,
} from "./types";

export default function AdminPage() {
  const [activities, setActivities] = useState<DashboardActivity[]>([]);
  const [participants, setParticipants] = useState<DashboardParticipant[]>([]);
  const [foodOptions, setFoodOptions] = useState<DashboardFoodOption[]>([]);
  const [groceryItems, setGroceryItems] = useState<DashboardGroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [eggToast, setEggToast] = useState<EasterEggToastPayload>(null);
  const [deletingParticipantId, setDeletingParticipantId] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const exportTextareaRef = useRef<HTMLTextAreaElement>(null);

  async function loadDashboard() {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/dashboard");
      const raw = await response.text();
      let data: Record<string, unknown> = {};
      if (raw.trim()) {
        try {
          data = JSON.parse(raw) as Record<string, unknown>;
        } catch {
          setMessage("Dashboard response was not valid JSON.");
          return;
        }
      }
      if (!response.ok) {
        const err =
          typeof data.error === "string" ? data.error : `Could not load dashboard (${response.status}).`;
        setMessage(err);
        return;
      }
      setActivities((data.activities as DashboardActivity[]) ?? []);
      setParticipants((data.participants as DashboardParticipant[]) ?? []);
      setFoodOptions((data.foodOptions as DashboardFoodOption[]) ?? []);
      setGroceryItems((data.groceryItems as DashboardGroceryItem[]) ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDashboard();
  }, []);

  const dismissEggToast = useCallback(() => setEggToast(null), []);

  useEffect(() => {
    const pid = getSessionParticipantId();
    if (!pid) return;
    void (async () => {
      const n = await reportEasterEggToServer(pid, "admin_detour");
      if (n != null) {
        setEggToast({ count: n, line: easterEggToastLine("admin_detour") });
      }
    })();
  }, []);

  function reactionNames(activity: DashboardActivity, reaction: "PASS" | "LIKE" | "SUPERLIKE") {
    return activity.swipes
      .filter((swipe) => swipe.reaction === reaction)
      .map((swipe) => swipe.participant.name)
      .sort((a, b) => a.localeCompare(b));
  }

  /** Likes and superlikes in one list; superlikes prefixed with ★ for CSV / text export. */
  function likesAndSuperlikesDisplay(activity: DashboardActivity): string {
    const entries = activity.swipes
      .filter((s) => s.reaction === "LIKE" || s.reaction === "SUPERLIKE")
      .map((s) => ({
        sortKey: s.participant.name.toLowerCase(),
        label: s.reaction === "SUPERLIKE" ? `★ ${s.participant.name}` : s.participant.name,
      }))
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    if (entries.length === 0) return "—";
    return entries.map((e) => e.label).join("; ");
  }

  const activityPopularity = useMemo(() => {
    const rows = activities.map((a) => {
      let likes = 0;
      let superlikes = 0;
      let passes = 0;
      for (const s of a.swipes) {
        if (s.reaction === "LIKE") likes += 1;
        else if (s.reaction === "SUPERLIKE") superlikes += 1;
        else if (s.reaction === "PASS") passes += 1;
      }
      const total = likes + superlikes + passes;
      const score = likes + superlikes * 2;
      return { id: a.id, title: a.title, likes, superlikes, passes, total, score };
    });
    const sorted = [...rows].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.superlikes !== a.superlikes) return b.superlikes - a.superlikes;
      return a.title.localeCompare(b.title);
    });
    const maxScore = Math.max(1, ...sorted.map((r) => r.score));
    return { sorted, top: sorted.slice(0, 8), maxScore };
  }, [activities]);

  const foodSelectionChart = useMemo(() => {
    const rows = foodOptions.map((f) => ({
      id: f.id,
      title: f.title,
      count: f.selections.length,
    }));
    rows.sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));
    const maxCount = Math.max(1, ...rows.map((r) => r.count));
    return { rows, maxCount };
  }, [foodOptions]);

  const exportPlainText = useMemo(() => {
    const voteLines = ["LIKES & SUPERLIKES BY ACTIVITY (★ = superlike)", ""];
    for (const a of activities) {
      voteLines.push(`${a.title}: ${likesAndSuperlikesDisplay(a)}`);
    }
    const groceryLines = ["", "GROCERY LIST", ""];
    if (groceryItems.length === 0) {
      groceryLines.push("(none yet)");
    } else {
      for (const g of groceryItems) {
        groceryLines.push(`${g.item} (${g.participant.name})`);
      }
    }
    const foodLines = ["", "FOOD SELECTIONS BY GUEST", ""];
    const sortedParticipants = [...participants].sort((a, b) => a.name.localeCompare(b.name));
    for (const p of sortedParticipants) {
      const titles = p.foodSelections
        .map((s) => s.foodOption.title)
        .sort((a, b) => a.localeCompare(b));
      foodLines.push(`${p.name}: ${titles.length ? titles.join(", ") : "—"}`);
    }
    return [...voteLines, ...groceryLines, ...foodLines].join("\n");
  }, [activities, groceryItems, participants]);

  const exportCsv = useMemo(() => {
    const esc = (cell: string) => `"${cell.replace(/"/g, '""')}"`;
    const rows: string[] = [];
    rows.push(`${esc("Activity")},${esc("Likes & superlikes (★ = superlike)")}`);
    for (const a of activities) {
      rows.push(`${esc(a.title)},${esc(likesAndSuperlikesDisplay(a))}`);
    }
    rows.push("");
    rows.push(`${esc("Grocery item")},${esc("Added by")}`);
    for (const g of groceryItems) {
      rows.push(`${esc(g.item)},${esc(g.participant.name)}`);
    }
    rows.push("");
    rows.push(`${esc("Participant")},${esc("Food selections")}`);
    const sortedParticipants = [...participants].sort((a, b) => a.name.localeCompare(b.name));
    for (const p of sortedParticipants) {
      const titles = p.foodSelections
        .map((s) => s.foodOption.title)
        .sort((a, b) => a.localeCompare(b));
      rows.push(`${esc(p.name)},${esc(titles.length ? titles.join("; ") : "—")}`);
    }
    return rows.join("\n");
  }, [activities, groceryItems, participants]);

  async function copyExportBlock() {
    setExportMessage(null);
    try {
      await navigator.clipboard.writeText(exportPlainText);
      setExportMessage("Copied to clipboard.");
    } catch {
      exportTextareaRef.current?.select();
      setExportMessage("Copy blocked — text is selected below; use ⌘C / Ctrl+C.");
    }
  }

  function downloadExportCsv() {
    const blob = new Blob([exportCsv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "birthday-export.csv";
    a.click();
    URL.revokeObjectURL(url);
    setExportMessage("CSV downloaded.");
  }

  async function deleteParticipant(id: string, displayName: string) {
    if (
      !window.confirm(
        `Remove ${displayName} and delete all their votes, food picks, grocery rows, and easter egg finds? This cannot be undone.`,
      )
    ) {
      return;
    }
    setDeletingParticipantId(id);
    setMessage(null);
    setExportMessage(null);
    try {
      const res = await fetch(`/api/admin/participants/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const raw = await res.text();
      let data: Record<string, unknown> = {};
      if (raw.trim()) {
        try {
          data = JSON.parse(raw) as Record<string, unknown>;
        } catch {
          setMessage("Delete response was not valid JSON.");
          return;
        }
      }
      if (!res.ok) {
        setMessage(typeof data.error === "string" ? data.error : "Could not delete participant.");
        return;
      }
      await loadDashboard();
    } finally {
      setDeletingParticipantId(null);
    }
  }

  const eggLeaderboard = useMemo(() => {
    return [...participants]
      .map((participant) => {
        const unique = new Set(
          participant.easterEggFinds.map((row) => row.eggKey).filter((k): k is string => Boolean(k)),
        );
        return { id: participant.id, name: participant.name, count: unique.size };
      })
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.name.localeCompare(b.name);
      })
      .map((row, index) => ({ ...row, rank: index + 1 }))
      .slice(0, 3);
  }, [participants]);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <EasterEggToast toast={eggToast} onDismiss={dismissEggToast} />
      <FloatingMysteryBox theme="light" candidateEggs={["admin_detour"]} />
      <div className="mx-auto w-full max-w-6xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin</h1>
            <p className="mt-1 text-sm text-slate-600">
              Voting results and easter egg standings. Totals: {participants.length} participants.
            </p>
          </div>
          <Link
            href="/"
            className="shrink-0 rounded-lg border border-slate-400 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
          >
            ← Guest voting home
          </Link>
        </div>
        {message ? <p className="mt-4 text-sm font-medium text-sky-800">{message}</p> : null}

        <CollapsibleSection
          className="mt-8"
          title="Insights"
          description={
            <>
              Popular activities ranked by interest (likes + 2× superlikes). Bars show how each vote type
              split for that activity.
            </>
          }
        >
          <div className="mt-4 grid gap-8 lg:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Most popular activities
              </h3>
              {loading ? (
                <p className="mt-4 text-sm text-slate-500">Loading…</p>
              ) : activityPopularity.top.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">No activities in the catalog.</p>
              ) : (
                <ul className="mt-4 space-y-5">
                  {activityPopularity.top.map((row, idx) => {
                    const pct = (n: number) => (row.total > 0 ? (n / row.total) * 100 : 0);
                    const scoreBarPct = (row.score / activityPopularity.maxScore) * 100;
                    return (
                      <li key={row.id} className="rounded-xl border border-slate-200/90 bg-gradient-to-br from-white to-slate-50/80 p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 flex-1 items-start gap-3">
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                idx === 0
                                  ? "bg-amber-400 text-amber-950"
                                  : idx === 1
                                    ? "bg-slate-300 text-slate-900"
                                    : idx === 2
                                      ? "bg-amber-700/25 text-amber-950"
                                      : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold leading-snug text-slate-900">{row.title}</p>
                              <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-600">
                                <span>
                                  <span className="text-amber-600">★</span> {row.superlikes} super
                                </span>
                                <span className="text-emerald-700">{row.likes} likes</span>
                                <span className="text-slate-500">{row.passes} passes</span>
                                <span className="font-medium text-slate-800">{row.total} votes</span>
                              </p>
                            </div>
                          </div>
                          <span className="shrink-0 rounded-md bg-slate-900 px-2 py-1 text-xs font-bold tabular-nums text-white">
                            {row.score} pts
                          </span>
                        </div>
                        <div className="mt-3 space-y-2">
                          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-200/90">
                            {row.total > 0 ? (
                              <>
                                <div
                                  className="h-full bg-amber-400 transition-all"
                                  style={{ width: `${pct(row.superlikes)}%` }}
                                  title="Superlikes"
                                />
                                <div
                                  className="h-full bg-emerald-500 transition-all"
                                  style={{ width: `${pct(row.likes)}%` }}
                                  title="Likes"
                                />
                                <div
                                  className="h-full bg-slate-400 transition-all"
                                  style={{ width: `${pct(row.passes)}%` }}
                                  title="Passes"
                                />
                              </>
                            ) : (
                              <div className="h-full w-full bg-slate-100" title="No votes yet" />
                            )}
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 opacity-90"
                              style={{ width: `${scoreBarPct}%` }}
                              title="Relative interest score"
                            />
                          </div>
                          <p className="text-[10px] uppercase tracking-wide text-slate-400">
                            Upper bar: vote mix · lower bar: rank vs top score
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Food option picks
              </h3>
              {loading ? (
                <p className="mt-4 text-sm text-slate-500">Loading…</p>
              ) : foodSelectionChart.rows.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">No food options in the catalog.</p>
              ) : (
                <div className="mt-4 max-h-[min(420px,70vh)] space-y-3 overflow-y-auto pr-1">
                  <div className="mb-2 flex flex-wrap gap-4 text-[11px] text-slate-500">
                    <span>
                      Max <span className="font-semibold text-slate-700">{foodSelectionChart.maxCount}</span>{" "}
                      picks (one bar)
                    </span>
                  </div>
                  {foodSelectionChart.rows.map((row) => (
                    <div key={row.id} className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="min-w-0 truncate text-sm font-medium text-slate-900" title={row.title}>
                          {row.title}
                        </p>
                        <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-600">
                          {row.count}
                        </span>
                      </div>
                      <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-200/90">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-teal-500 via-emerald-500 to-lime-500"
                          style={{
                            width: row.count === 0 ? "0%" : `${(row.count / foodSelectionChart.maxCount) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          className="mt-8"
          id="easter-section-heading"
          variant="amber"
          title="Easter eggs"
          description={
            <>
              Top 3 by unique finds, then the full per-person list ({EASTER_EGG_KEYS.length} possible). Guests
              can trigger hidden interactions across the app.
            </>
          }
        >
            <div className="border-b border-slate-200 bg-white px-0">
              <p className="px-5 pt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Standings (top 3)
              </p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[min(100%,480px)] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-white/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-2.5" scope="col">
                        Rank
                      </th>
                      <th className="px-5 py-2.5" scope="col">
                        Participant
                      </th>
                      <th className="px-5 py-2.5 text-right tabular-nums" scope="col">
                        Found
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {loading ? (
                      <tr>
                        <td className="px-5 py-4 text-slate-500" colSpan={3}>
                          Loading…
                        </td>
                      </tr>
                    ) : eggLeaderboard.length === 0 ? (
                      <tr>
                        <td className="px-5 py-4 text-slate-500" colSpan={3}>
                          No participants yet.
                        </td>
                      </tr>
                    ) : (
                      eggLeaderboard.map((row) => {
                        const pct = EASTER_EGG_KEYS.length
                          ? Math.round((row.count / EASTER_EGG_KEYS.length) * 100)
                          : 0;
                        const topThree = row.rank <= 3 && row.count > 0;
                        return (
                          <tr
                            key={row.id}
                            className={
                              topThree ? "bg-amber-50/40" : row.count > 0 ? "" : "text-slate-400"
                            }
                          >
                            <td className="px-5 py-3 font-medium tabular-nums text-slate-700">
                              {row.rank <= 3 && row.count > 0 ? (
                                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-200/90 text-sm font-bold text-amber-950">
                                  {row.rank}
                                </span>
                              ) : (
                                <span className="pl-1">{row.rank}</span>
                              )}
                            </td>
                            <td className="px-5 py-3 font-medium text-slate-900">{row.name}</td>
                            <td className="px-5 py-3 text-right">
                              <span className="tabular-nums font-semibold text-slate-900">
                                {row.count}/{EASTER_EGG_KEYS.length}
                              </span>
                              <span className="ml-2 text-xs text-slate-500">({pct}%)</span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white px-0 pb-1">
              <p className="px-5 pt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Which eggs each person found
              </p>
              <div className="mt-2 overflow-x-auto px-0">
                <table className="w-full min-w-[720px] text-left text-sm text-slate-800">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-slate-900">Participant</th>
                      <th className="px-4 py-3 text-slate-900">Found</th>
                      <th className="px-4 py-3 text-slate-900">Eggs</th>
                      <th className="px-4 py-3 text-right text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant) => {
                      const keys = [
                        ...new Set(
                          participant.easterEggFinds
                            .map((row) => row.eggKey)
                            .filter((k): k is string => typeof k === "string"),
                        ),
                      ].sort((a, b) => a.localeCompare(b));
                      const labels = keys.map((key) =>
                        isEasterEggKey(key) ? easterEggLabel(key) : key,
                      );
                      return (
                        <tr key={participant.id} className="border-t border-slate-200 align-top">
                          <td className="px-4 py-3 font-medium text-slate-900">{participant.name}</td>
                          <td className="px-4 py-3 tabular-nums text-slate-800">
                            {keys.length}/{EASTER_EGG_KEYS.length}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {labels.length ? labels.join(" · ") : "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              disabled={deletingParticipantId === participant.id}
                              onClick={() => void deleteParticipant(participant.id, participant.name)}
                              className="rounded-md border border-rose-300 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-900 hover:bg-rose-100 disabled:opacity-50"
                            >
                              {deletingParticipantId === participant.id ? "Removing…" : "Remove"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
        </CollapsibleSection>

        <CollapsibleSection
          className="mt-10"
          title="Shared grocery list"
          description="Items guests added for the weekend."
        >
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-300 bg-white shadow-sm">
            <table className="w-full min-w-[700px] text-left text-sm text-slate-800">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-slate-900">Item</th>
                  <th className="px-4 py-3 text-slate-900">Added by</th>
                </tr>
              </thead>
              <tbody>
                {groceryItems.length > 0 ? (
                  groceryItems.map((entry) => (
                    <tr key={entry.id} className="border-t border-slate-200 align-top">
                      <td className="px-4 py-3 text-slate-800">{entry.item}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{entry.participant.name}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t border-slate-200">
                    <td className="px-4 py-3 text-slate-600" colSpan={2}>
                      No grocery items added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CollapsibleSection>

        <CollapsibleSection className="mt-10" title="Who picked what">
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-300 bg-white shadow-sm">
            <table className="w-full min-w-[900px] text-left text-sm text-slate-800">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-slate-900">Activity</th>
                  <th className="px-4 py-3 text-slate-900">Superlikes</th>
                  <th className="px-4 py-3 text-slate-900">Likes</th>
                  <th className="px-4 py-3 text-slate-900">Passes</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => {
                  const superlikes = reactionNames(activity, "SUPERLIKE");
                  const likes = reactionNames(activity, "LIKE");
                  const passes = reactionNames(activity, "PASS");

                  return (
                    <tr key={activity.id} className="border-t border-slate-200 align-top">
                      <td className="px-4 py-3 font-medium text-slate-900">{activity.title}</td>
                      <td className="px-4 py-3 text-blue-800">
                        {superlikes.length ? superlikes.join(", ") : "—"}
                      </td>
                      <td className="px-4 py-3 text-emerald-800">
                        {likes.length ? likes.join(", ") : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {passes.length ? passes.join(", ") : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          className="mt-10"
          defaultOpen={false}
          title="Export for WhatsApp / Sheets"
          description={
            <>
              Likes and superlikes per activity (★ marks a superlike), grocery list, and each guest&apos;s
              food picks — copy as text or download CSV.
            </>
          }
        >
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void copyExportBlock()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Copy text block
            </button>
            <button
              type="button"
              onClick={downloadExportCsv}
              className="rounded-lg border border-slate-400 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Download CSV
            </button>
          </div>
          {exportMessage ? <p className="mt-2 text-sm text-emerald-800">{exportMessage}</p> : null}
          <textarea
            ref={exportTextareaRef}
            readOnly
            value={exportPlainText}
            rows={12}
            className="mt-3 w-full resize-y rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-xs text-slate-800"
            aria-label="Export preview"
          />
        </CollapsibleSection>

        <div className="mt-12 flex flex-wrap justify-center gap-3 border-t border-slate-200 pt-10">
          <Link
            href="/"
            className="inline-flex rounded-xl border border-slate-400 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
          >
            ← Guest voting home
          </Link>
          <Link
            href="/admin/catalog"
            className="inline-flex rounded-xl border border-slate-400 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
          >
            Edit catalog &amp; food →
          </Link>
        </div>
      </div>
    </main>
  );
}

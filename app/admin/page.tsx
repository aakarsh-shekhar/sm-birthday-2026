"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EasterEggToast, type EasterEggToastPayload } from "@/app/components/EasterEggToast";
import { getSessionParticipantId, reportEasterEggToServer } from "@/lib/easter-egg-client";
import { EASTER_EGG_KEYS, easterEggLabel, easterEggToastLine, isEasterEggKey } from "@/lib/easter-eggs";

import type { DashboardActivity, DashboardGroceryItem, DashboardParticipant } from "./types";

export default function AdminPage() {
  const [activities, setActivities] = useState<DashboardActivity[]>([]);
  const [participants, setParticipants] = useState<DashboardParticipant[]>([]);
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

  const exportPlainText = useMemo(() => {
    const superLines = ["SUPERLIKES BY ACTIVITY", ""];
    for (const a of activities) {
      const names = reactionNames(a, "SUPERLIKE");
      superLines.push(`${a.title}: ${names.length ? names.join(", ") : "—"}`);
    }
    const groceryLines = ["", "GROCERY LIST", ""];
    if (groceryItems.length === 0) {
      groceryLines.push("(none yet)");
    } else {
      for (const g of groceryItems) {
        groceryLines.push(`${g.item} (${g.participant.name})`);
      }
    }
    return [...superLines, ...groceryLines].join("\n");
  }, [activities, groceryItems]);

  const exportCsv = useMemo(() => {
    const esc = (cell: string) => `"${cell.replace(/"/g, '""')}"`;
    const rows: string[] = [];
    rows.push(`${esc("Activity")},${esc("Superlikes")}`);
    for (const a of activities) {
      const names = reactionNames(a, "SUPERLIKE");
      rows.push(`${esc(a.title)},${esc(names.length ? names.join("; ") : "—")}`);
    }
    rows.push("");
    rows.push(`${esc("Grocery item")},${esc("Added by")}`);
    for (const g of groceryItems) {
      rows.push(`${esc(g.item)},${esc(g.participant.name)}`);
    }
    return rows.join("\n");
  }, [activities, groceryItems]);

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
      .map((row, index) => ({ ...row, rank: index + 1 }));
  }, [participants]);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <EasterEggToast toast={eggToast} onDismiss={dismissEggToast} />
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

        <section className="mt-8 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Export for WhatsApp / Sheets</h2>
          <p className="mt-1 text-sm text-slate-600">
            Superlikes by activity plus the shared grocery list — copy as text or download CSV.
          </p>
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
        </section>

        <section className="mt-8" aria-labelledby="easter-section-heading">
          <div className="overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-white to-amber-50/50 shadow-md">
            <div className="border-b border-amber-200/60 bg-amber-100/50 px-5 py-3">
              <h2 id="easter-section-heading" className="text-lg font-bold text-slate-900">
                Easter eggs
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                Leaderboard by unique finds, then per-person list (
                {EASTER_EGG_KEYS.length} possible). Guests can trigger hidden interactions across the app.
              </p>
            </div>

            <div className="border-b border-slate-200 bg-white px-0">
              <p className="px-5 pt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Standings</p>
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
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">Shared grocery list</h2>
          <p className="mt-1 text-sm text-slate-600">Items guests added for the weekend.</p>
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
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">Who picked what</h2>
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
        </section>

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

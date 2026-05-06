"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useState } from "react";

import { EasterEggToast, type EasterEggToastPayload } from "@/app/components/EasterEggToast";
import { getSessionParticipantId, reportEasterEggToServer } from "@/lib/easter-egg-client";
import { EASTER_EGG_KEYS, easterEggLabel, easterEggToastLine, isEasterEggKey } from "@/lib/easter-eggs";

type DashboardSwipe = {
  id: string;
  reaction: "PASS" | "LIKE" | "SUPERLIKE";
  participant: { id: string; name: string };
};

type DashboardActivity = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  imageUrl: string | null;
  activityUrl: string | null;
  includedInStay: boolean | null;
  swipes: DashboardSwipe[];
};

type DashboardParticipant = {
  id: string;
  name: string;
  swipes: Array<{
    id: string;
    reaction: "PASS" | "LIKE" | "SUPERLIKE";
    activity: { id: string; title: string };
  }>;
  foodSelections: Array<{
    id: string;
    foodOption: { id: string; title: string };
  }>;
  groceryNote: { id: string; note: string } | null;
  easterEggFinds: Array<{ eggKey: string }>;
};

type DashboardFoodOption = {
  id: string;
  title: string;
  description: string | null;
  infoUrl: string | null;
  selections: Array<{
    id: string;
    participant: { id: string; name: string };
  }>;
};

type DashboardGroceryItem = {
  id: string;
  item: string;
  participant: { id: string; name: string };
};

type ActivityForm = {
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  activityUrl: string;
  includedInStay: boolean;
};

type FoodOptionForm = {
  title: string;
  description: string;
  infoUrl: string;
};

const defaultImage = "/activity-images/default-activity.svg";

function toForm(activity: DashboardActivity): ActivityForm {
  return {
    title: activity.title,
    description: activity.description ?? "",
    category: activity.category ?? "",
    imageUrl: activity.imageUrl ?? "",
    activityUrl: activity.activityUrl ?? "",
    includedInStay: activity.includedInStay ?? false,
  };
}

export default function AdminPage() {
  const [activities, setActivities] = useState<DashboardActivity[]>([]);
  const [participants, setParticipants] = useState<DashboardParticipant[]>([]);
  const [foodOptions, setFoodOptions] = useState<DashboardFoodOption[]>([]);
  const [groceryItems, setGroceryItems] = useState<DashboardGroceryItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ActivityForm>({
    title: "",
    description: "",
    category: "",
    imageUrl: "",
    activityUrl: "",
    includedInStay: false,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [foodModalMode, setFoodModalMode] = useState<"add" | "edit">("add");
  const [editingFoodOptionId, setEditingFoodOptionId] = useState<string | null>(null);
  const [foodForm, setFoodForm] = useState<FoodOptionForm>({
    title: "",
    description: "",
    infoUrl: "",
  });
  const [eggToast, setEggToast] = useState<EasterEggToastPayload>(null);

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

  function reactionNames(activity: DashboardActivity, reaction: DashboardSwipe["reaction"]) {
    return activity.swipes
      .filter((swipe) => swipe.reaction === reaction)
      .map((swipe) => swipe.participant.name)
      .sort((a, b) => a.localeCompare(b));
  }

  async function createActivity() {
    if (!form.title.trim()) return;
    setMessage(null);
    const response = await fetch("/api/admin/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      setMessage("Could not create activity.");
      return;
    }
    setForm({
      title: "",
      description: "",
      category: "",
      imageUrl: "",
      activityUrl: "",
      includedInStay: false,
    });
    await loadDashboard();
    setMessage("Activity added.");
    setModalOpen(false);
  }

  async function saveActivity() {
    if (!editingId || !form.title.trim()) return;
    setMessage(null);
    const response = await fetch(`/api/admin/activities/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      setMessage("Could not save activity.");
      return;
    }
    await loadDashboard();
    setMessage("Activity updated.");
    setModalOpen(false);
    setEditingId(null);
  }

  async function deleteActivity(id: string) {
    const confirmed = window.confirm("Delete this activity and all related votes?");
    if (!confirmed) return;
    setMessage(null);
    const response = await fetch(`/api/admin/activities/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setMessage("Could not delete activity.");
      return;
    }
    await loadDashboard();
    setMessage("Activity deleted.");
  }

  function openAddModal() {
    setModalMode("add");
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      category: "",
      imageUrl: "",
      activityUrl: "",
      includedInStay: false,
    });
    setModalOpen(true);
  }

  function openEditModal(activity: DashboardActivity) {
    setModalMode("edit");
    setEditingId(activity.id);
    setForm(toForm(activity));
    setModalOpen(true);
  }

  function openAddFoodOptionModal() {
    setFoodModalMode("add");
    setEditingFoodOptionId(null);
    setFoodForm({ title: "", description: "", infoUrl: "" });
    setFoodModalOpen(true);
  }

  function openEditFoodOptionModal(option: DashboardFoodOption) {
    setFoodModalMode("edit");
    setEditingFoodOptionId(option.id);
    setFoodForm({
      title: option.title,
      description: option.description ?? "",
      infoUrl: option.infoUrl ?? "",
    });
    setFoodModalOpen(true);
  }

  async function saveFoodOption() {
    if (!foodForm.title.trim()) return;
    const payload = {
      title: foodForm.title.trim(),
      description: foodForm.description.trim() || null,
      infoUrl: foodForm.infoUrl.trim() || null,
    };
    setMessage(null);
    const isEdit = foodModalMode === "edit" && editingFoodOptionId;
    const response = await fetch(
      isEdit ? `/api/admin/food-options/${editingFoodOptionId}` : "/api/admin/food-options",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    if (!response.ok) {
      setMessage(`Could not ${isEdit ? "update" : "create"} food option.`);
      return;
    }
    await loadDashboard();
    setFoodModalOpen(false);
    setMessage(`Food option ${isEdit ? "updated" : "added"}.`);
  }

  async function deleteFoodOption(id: string) {
    const confirmed = window.confirm("Delete this food option?");
    if (!confirmed) return;
    setMessage(null);
    const response = await fetch(`/api/admin/food-options/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setMessage("Could not delete food option.");
      return;
    }
    await loadDashboard();
    setMessage("Food option deleted.");
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
      <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>

      <section className="mt-6" aria-labelledby="egg-leaderboard-heading">
        <div className="overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-white to-amber-50/50 shadow-md">
          <div className="border-b border-amber-200/60 bg-amber-100/50 px-5 py-3">
            <h2 id="egg-leaderboard-heading" className="text-lg font-bold text-slate-900">
              Easter egg leaderboard
            </h2>
            <p className="mt-0.5 text-sm text-slate-600">
              Ranked by unique eggs found (out of {EASTER_EGG_KEYS.length}).
            </p>
          </div>
          <div className="overflow-x-auto px-0">
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
                    Eggs
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td className="px-5 py-4 text-slate-500" colSpan={3}>
                      Loading leaderboard…
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
      </section>

      <p className="mt-6 text-sm text-slate-700">Total participants: {participants.length}</p>
      {message ? <p className="mt-3 text-sm font-medium text-sky-800">{message}</p> : null}

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">Easter eggs</h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Guests can discover hidden interactions across the site (including this page). Each row shows
          how many that participant unlocked ({EASTER_EGG_KEYS.length} total) and which ones.
        </p>
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-300 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm text-slate-800">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-slate-900">Participant</th>
                <th className="px-4 py-3 text-slate-900">Found</th>
                <th className="px-4 py-3 text-slate-900">Eggs</th>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">Who Picked What</h2>
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
                      {superlikes.length ? superlikes.join(", ") : "-"}
                    </td>
                    <td className="px-4 py-3 text-emerald-800">
                      {likes.length ? likes.join(", ") : "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {passes.length ? passes.join(", ") : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Food Selections</h2>
          <button
            onClick={openAddFoodOptionModal}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Add food option
          </button>
        </div>
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-300 bg-white shadow-sm">
          <table className="w-full min-w-[900px] text-left text-sm text-slate-800">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-slate-900">Food Option</th>
                <th className="px-4 py-3 text-slate-900">Details</th>
                <th className="px-4 py-3 text-slate-900">Selected By</th>
              </tr>
            </thead>
            <tbody>
              {foodOptions.map((option) => {
                const names = option.selections
                  .map((selection) => selection.participant.name)
                  .sort((a, b) => a.localeCompare(b));
                return (
                  <tr key={option.id} className="border-t border-slate-200 align-top">
                    <td className="px-4 py-3 font-medium text-slate-900">{option.title}</td>
                    <td className="max-w-md px-4 py-3 text-xs text-slate-600">
                      {option.description ? (
                        <p className="line-clamp-2">{option.description}</p>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                      {option.infoUrl ? (
                        <a
                          href={option.infoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-block text-sky-800 underline"
                        >
                          Link
                        </a>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div className="flex items-center justify-between gap-3">
                        <span>{names.length ? names.join(", ") : "-"}</span>
                        <span className="flex shrink-0 gap-2">
                          <button
                            onClick={() => openEditFoodOptionModal(option)}
                            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteFoodOption(option.id)}
                            className="rounded-md border border-red-300 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-800"
                          >
                            Delete
                          </button>
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900">Shared Grocery List</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-300 bg-white shadow-sm">
          <table className="w-full min-w-[700px] text-left text-sm text-slate-800">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-slate-900">Item</th>
                <th className="px-4 py-3 text-slate-900">Added By</th>
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
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Activities</h2>
          <button
            onClick={openAddModal}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Add activity
          </button>
        </div>
        {loading ? <p className="mt-3 text-sm text-slate-700">Loading...</p> : null}
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-300 bg-white shadow-sm">
          <table className="w-full min-w-[980px] text-left text-sm text-slate-800">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-slate-900">Image</th>
                <th className="px-4 py-3 text-slate-900">Name</th>
                <th className="px-4 py-3 text-slate-900">Category</th>
                <th className="px-4 py-3 text-slate-900">Included</th>
                <th className="px-4 py-3 text-slate-900">Activity URL</th>
                <th className="px-4 py-3 text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id} className="border-t border-slate-200">
                  <td className="px-4 py-3">
                    <img
                      src={
                        activity.imageUrl?.trim() &&
                        (/^https?:\/\//i.test(activity.imageUrl) || activity.imageUrl.startsWith("/"))
                          ? activity.imageUrl
                          : defaultImage
                      }
                      alt={activity.title}
                      className="h-14 w-24 rounded-md object-cover"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{activity.title}</td>
                  <td className="px-4 py-3 text-slate-800">{activity.category ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-800">
                    {activity.includedInStay === null
                      ? "-"
                      : activity.includedInStay
                        ? "Yes"
                        : "No"}
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-slate-800">
                    {activity.activityUrl ? (
                      <a
                        href={activity.activityUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-800 underline underline-offset-2"
                      >
                        Open link
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(activity)}
                        className="rounded-md border border-slate-400 bg-white px-3 py-1.5 font-medium text-slate-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteActivity(activity.id)}
                        className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 font-medium text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-300 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                {modalMode === "add" ? "Add Activity" : "Edit Activity"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-md border border-slate-400 bg-white px-2 py-1 text-sm text-slate-900"
              >
                Close
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Title"
                className="rounded-lg border border-slate-400 px-3 py-2 text-slate-900 placeholder:text-slate-500"
              />
              <input
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                placeholder="Category"
                className="rounded-lg border border-slate-400 px-3 py-2 text-slate-900 placeholder:text-slate-500"
              />
              <input
                value={form.imageUrl}
                onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
                placeholder="Image URL (https://...) or path under /activity-images/..."
                className="rounded-lg border border-slate-400 px-3 py-2 text-slate-900 placeholder:text-slate-500 md:col-span-2"
              />
              <input
                value={form.activityUrl}
                onChange={(event) => setForm({ ...form, activityUrl: event.target.value })}
                placeholder="Activity URL"
                className="rounded-lg border border-slate-400 px-3 py-2 text-slate-900 placeholder:text-slate-500 md:col-span-2"
              />
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Description"
                className="min-h-24 rounded-lg border border-slate-400 px-3 py-2 text-slate-900 placeholder:text-slate-500 md:col-span-2"
              />
              <label className="flex items-center gap-2 text-sm font-medium text-slate-900">
                <input
                  type="checkbox"
                  checked={form.includedInStay}
                  onChange={(event) => setForm({ ...form, includedInStay: event.target.checked })}
                />
                Included in stay
              </label>
              <div className="flex justify-end gap-2 md:col-span-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-400 bg-white px-4 py-2 font-medium text-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={modalMode === "add" ? createActivity : saveActivity}
                  className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white"
                >
                  {modalMode === "add" ? "Add" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {foodModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-300 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                {foodModalMode === "add" ? "Add Food Option" : "Edit Food Option"}
              </h3>
              <button
                onClick={() => setFoodModalOpen(false)}
                className="rounded-md border border-slate-400 bg-white px-2 py-1 text-sm text-slate-900"
              >
                Close
              </button>
            </div>
            <label className="block text-xs font-medium text-slate-600" htmlFor="food-title">
              Title
            </label>
            <input
              id="food-title"
              value={foodForm.title}
              onChange={(event) => setFoodForm({ ...foodForm, title: event.target.value })}
              placeholder="Food option title"
              className="mt-1 w-full rounded-lg border border-slate-400 px-3 py-2 text-slate-900 placeholder:text-slate-500"
            />
            <label className="mt-3 block text-xs font-medium text-slate-600" htmlFor="food-desc">
              Description
            </label>
            <textarea
              id="food-desc"
              value={foodForm.description}
              onChange={(event) => setFoodForm({ ...foodForm, description: event.target.value })}
              placeholder="Short description for guests"
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-400 px-3 py-2 text-slate-900 placeholder:text-slate-500"
            />
            <label className="mt-3 block text-xs font-medium text-slate-600" htmlFor="food-url">
              Info URL
            </label>
            <input
              id="food-url"
              value={foodForm.infoUrl}
              onChange={(event) => setFoodForm({ ...foodForm, infoUrl: event.target.value })}
              placeholder="https://..."
              className="mt-1 w-full rounded-lg border border-slate-400 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setFoodModalOpen(false)}
                className="rounded-lg border border-slate-400 bg-white px-4 py-2 font-medium text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={saveFoodOption}
                className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white"
              >
                {foodModalMode === "add" ? "Add" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      </div>
    </main>
  );
}

"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  type ActivityForm,
  type DashboardActivity,
  type DashboardFoodOption,
  type FoodOptionForm,
  activityToForm,
  defaultActivityImage,
} from "@/app/admin/types";

export default function AdminCatalogPage() {
  const [activities, setActivities] = useState<DashboardActivity[]>([]);
  const [foodOptions, setFoodOptions] = useState<DashboardFoodOption[]>([]);
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
      setFoodOptions((data.foodOptions as DashboardFoodOption[]) ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDashboard();
  }, []);

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
    setForm(activityToForm(activity));
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

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto w-full max-w-6xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-600">
              <Link href="/admin" className="text-sky-800 underline underline-offset-2 hover:text-sky-900">
                ← Admin home
              </Link>
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">Catalog & food</h1>
            <p className="mt-1 text-sm text-slate-600">
              Edit activities guests vote on and food options for the weekend.
            </p>
          </div>
        </div>

        {message ? <p className="mt-4 text-sm font-medium text-sky-800">{message}</p> : null}

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Food selections (options)</h2>
            <button
              type="button"
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
                  <th className="px-4 py-3 text-slate-900">Food option</th>
                  <th className="px-4 py-3 text-slate-900">Details</th>
                  <th className="px-4 py-3 text-slate-900">Selected by</th>
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
                          <span>{names.length ? names.join(", ") : "—"}</span>
                          <span className="flex shrink-0 gap-2">
                            <button
                              type="button"
                              onClick={() => openEditFoodOptionModal(option)}
                              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-900"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Activities</h2>
            <button
              type="button"
              onClick={openAddModal}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Add activity
            </button>
          </div>
          {loading ? <p className="mt-3 text-sm text-slate-700">Loading…</p> : null}
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
                            : defaultActivityImage
                        }
                        alt={activity.title}
                        className="h-14 w-24 rounded-md object-cover"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{activity.title}</td>
                    <td className="px-4 py-3 text-slate-800">{activity.category ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-800">
                      {activity.includedInStay === null
                        ? "—"
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
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(activity)}
                          className="rounded-md border border-slate-400 bg-white px-3 py-1.5 font-medium text-slate-900"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
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
                  {modalMode === "add" ? "Add activity" : "Edit activity"}
                </h3>
                <button
                  type="button"
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
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-lg border border-slate-400 bg-white px-4 py-2 font-medium text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
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
                  {foodModalMode === "add" ? "Add food option" : "Edit food option"}
                </h3>
                <button
                  type="button"
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
                  type="button"
                  onClick={() => setFoodModalOpen(false)}
                  className="rounded-lg border border-slate-400 bg-white px-4 py-2 font-medium text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
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

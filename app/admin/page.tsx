"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";

import { compressImageForAdminUpload } from "@/lib/client-compress-upload-image";

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
};

type DashboardFoodOption = {
  id: string;
  title: string;
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
};

const defaultImage = "/activity-images/default-activity.svg";

function isUploadedImage(url: string | null) {
  return !!url && /^\/activity-images\/upload-/i.test(url);
}

function toForm(activity: DashboardActivity): ActivityForm {
  return {
    title: activity.title,
    description: activity.description ?? "",
    category: activity.category ?? "",
    imageUrl: isUploadedImage(activity.imageUrl) ? activity.imageUrl ?? "" : "",
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [foodModalMode, setFoodModalMode] = useState<"add" | "edit">("add");
  const [editingFoodOptionId, setEditingFoodOptionId] = useState<string | null>(null);
  const [foodForm, setFoodForm] = useState<FoodOptionForm>({ title: "" });

  async function loadDashboard() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/dashboard");
      const data = await response.json();
      setActivities(data.activities ?? []);
      setParticipants(data.participants ?? []);
      setFoodOptions(data.foodOptions ?? []);
      setGroceryItems(data.groceryItems ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDashboard();
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

  async function uploadImage(file: File) {
    setUploadingImage(true);
    setMessage(null);
    try {
      const prepared = await compressImageForAdminUpload(file);
      const body = new FormData();
      body.append("file", prepared);
      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        body,
      });
      const data = (await response.json().catch(() => ({}))) as {
        imageUrl?: string;
        error?: string;
      };
      if (response.status === 413) {
        throw new Error(
          data.error ??
            "Image is still too large for the server (max ~4MB on hosting). Try a smaller file or another format.",
        );
      }
      if (!response.ok || !data.imageUrl) {
        throw new Error(data.error ?? "Could not upload image.");
      }
      setForm((prev) => ({ ...prev, imageUrl: data.imageUrl! }));
      setMessage("Image uploaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not upload image.");
    } finally {
      setUploadingImage(false);
    }
  }

  function openAddFoodOptionModal() {
    setFoodModalMode("add");
    setEditingFoodOptionId(null);
    setFoodForm({ title: "" });
    setFoodModalOpen(true);
  }

  function openEditFoodOptionModal(option: DashboardFoodOption) {
    setFoodModalMode("edit");
    setEditingFoodOptionId(option.id);
    setFoodForm({ title: option.title });
    setFoodModalOpen(true);
  }

  async function saveFoodOption() {
    if (!foodForm.title.trim()) return;
    setMessage(null);
    const isEdit = foodModalMode === "edit" && editingFoodOptionId;
    const response = await fetch(
      isEdit ? `/api/admin/food-options/${editingFoodOptionId}` : "/api/admin/food-options",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(foodForm),
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
      <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
      <p className="mt-2 text-sm text-slate-700">Total participants: {participants.length}</p>
      {message ? <p className="mt-3 text-sm font-medium text-sky-800">{message}</p> : null}

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
          <table className="w-full min-w-[700px] text-left text-sm text-slate-800">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-slate-900">Food Option</th>
                <th className="px-4 py-3 text-slate-900">Selected By</th>
              </tr>
            </thead>
            <tbody>
              {foodOptions.map((option) => {
                const names = option.selections
                  .map((selection) => selection.participant.name)
                  .sort((a, b) => a.localeCompare(b));
                return (
                  <tr key={option.id} className="border-t border-slate-200">
                    <td className="px-4 py-3 font-medium text-slate-900">{option.title}</td>
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
                      src={isUploadedImage(activity.imageUrl) ? activity.imageUrl! : defaultImage}
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
              <div className="grid gap-2 md:col-span-2">
                <input
                  value={form.imageUrl}
                  onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
                  placeholder="Image URL or local path"
                  className="rounded-lg border border-slate-400 px-3 py-2 text-slate-900 placeholder:text-slate-500"
                />
                <label className="inline-flex w-fit cursor-pointer items-center rounded-lg border border-slate-400 bg-white px-3 py-2 text-sm font-medium text-slate-900">
                  {uploadingImage ? "Uploading..." : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingImage}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void uploadImage(file);
                      }
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
              </div>
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
          <div className="w-full max-w-md rounded-xl border border-slate-300 bg-white p-5 shadow-xl">
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
            <input
              value={foodForm.title}
              onChange={(event) => setFoodForm({ title: event.target.value })}
              placeholder="Food option title"
              className="w-full rounded-lg border border-slate-400 px-3 py-2 text-slate-900 placeholder:text-slate-500"
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

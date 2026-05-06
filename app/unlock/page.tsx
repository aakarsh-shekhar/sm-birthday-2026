"use client";

import { FormEvent, useState } from "react";

export default function UnlockPage() {
  const [passcode, setPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Invalid passcode.");
      }
      window.location.href = "/";
    } catch (unlockError) {
      setError(unlockError instanceof Error ? unlockError.message : "Could not unlock.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-white/15 bg-slate-900/70 p-6 shadow-xl"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
          Private Event
        </p>
        <h1 className="mt-2 text-2xl font-bold">Enter passcode to access</h1>
        <p className="mt-2 text-sm text-slate-300">
          This birthday planner is invite-only. Ask host for the passcode.
        </p>
        <label className="mt-4 mb-2 block text-sm font-medium">Passcode</label>
        <input
          type="password"
          value={passcode}
          onChange={(event) => setPasscode(event.target.value)}
          className="w-full rounded-lg border border-white/20 bg-slate-950/60 px-3 py-2 outline-none placeholder:text-slate-400 focus:border-amber-300"
          placeholder="Enter passcode"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-50"
        >
          {isLoading ? "Checking..." : "Unlock event"}
        </button>
        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      </form>
    </main>
  );
}

import { isEasterEggKey, type EasterEggKey } from "@/lib/easter-eggs";

const STORAGE_KEY = "birthday-water-park-pending-eggs";

/** Same-tab guest id for cross-route easter eggs (e.g. admin visit). */
export const SESSION_PARTICIPANT_STORAGE_KEY = "birthday-water-park-session-participant";

export function persistSessionParticipantId(participantId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_PARTICIPANT_STORAGE_KEY, participantId);
  } catch {
    // ignore quota / private mode
  }
}

export function getSessionParticipantId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(SESSION_PARTICIPANT_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getPendingEasterEggs(): EasterEggKey[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: EasterEggKey[] = [];
    for (const item of parsed) {
      if (typeof item === "string" && isEasterEggKey(item) && !out.includes(item)) {
        out.push(item);
      }
    }
    return out;
  } catch {
    return [];
  }
}

/** Returns true if this egg was newly queued (false if already pending). */
export function queueEasterEgg(egg: EasterEggKey): boolean {
  if (typeof window === "undefined") return false;
  const pending = new Set(getPendingEasterEggs());
  if (pending.has(egg)) return false;
  pending.add(egg);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...pending]));
  return true;
}

export function clearPendingEasterEggs(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export async function reportEasterEggToServer(
  participantId: string,
  egg: EasterEggKey,
): Promise<number | null> {
  const response = await fetch("/api/easter-eggs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ participantId, eggKey: egg }),
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { uniqueEggCount?: unknown };
  return typeof data.uniqueEggCount === "number" ? data.uniqueEggCount : null;
}

export async function flushPendingEasterEggs(participantId: string): Promise<number | null> {
  const pending = getPendingEasterEggs();
  if (pending.length === 0) return null;
  const response = await fetch("/api/easter-eggs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ participantId, eggKeys: pending }),
  });
  if (!response.ok) return null;
  clearPendingEasterEggs();
  const data = (await response.json()) as { uniqueEggCount?: unknown };
  return typeof data.uniqueEggCount === "number" ? data.uniqueEggCount : null;
}

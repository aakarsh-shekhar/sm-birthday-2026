/** Server and client: canonical keys + human labels for admin UI. */
export const EASTER_EGG_KEYS = [
  "legacy_line",
  "dog_double_tap",
  "card_down_swipe",
  "food_title_triple",
  "grocery_sparkles",
  "admin_detour",
  "quote_dwell",
  "landing_deep_scroll",
  "finish_celebration",
  "swipe_halfway",
] as const;

export type EasterEggKey = (typeof EASTER_EGG_KEYS)[number];

const LABELS: Record<EasterEggKey, string> = {
  legacy_line: "Clicked “A legacy of celebration”",
  dog_double_tap: "Double-tapped the pup (portrait hot spot)",
  card_down_swipe: "Tried a downward swipe on an activity card",
  food_title_triple: "Triple-clicked “Food Picks”",
  grocery_sparkles: 'Added “sparkles” to the grocery list',
  admin_detour: "Opened the admin dashboard after joining",
  quote_dwell: "Read bottom quotes for at least 10 seconds (pre-name landing)",
  landing_deep_scroll: "Scrolled the intro all the way to the name form",
  finish_celebration: "Reached the final Cheers screen",
  swipe_halfway: "Got halfway or more through activity voting",
};

export function isEasterEggKey(value: string): value is EasterEggKey {
  return (EASTER_EGG_KEYS as readonly string[]).includes(value);
}

export function easterEggLabel(key: EasterEggKey): string {
  return LABELS[key];
}

/** Short line shown in the find toast popup. */
const TOAST_LINES: Record<EasterEggKey, string> = {
  legacy_line: "The opening line noticed you back.",
  dog_double_tap: "Good eye—say hi to the good dog.",
  card_down_swipe: "Wrong-way swipe, right kind of curiosity.",
  food_title_triple: "Third time’s the charm. Chef’s kiss.",
  grocery_sparkles: "The list just got a little more sparkly.",
  admin_detour: "Dashboard detour: the plot thickens.",
  quote_dwell: "You actually read the fine print at the bottom.",
  landing_deep_scroll: "Intro? Completed it, mate.",
  finish_celebration: "You made it to the big finish.",
  swipe_halfway: "Halfway hero—keep those votes coming.",
};

export function easterEggToastLine(key: EasterEggKey): string {
  return TOAST_LINES[key];
}

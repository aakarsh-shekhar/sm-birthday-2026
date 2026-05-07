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
  food_title_triple: "Double-clicked “Food Picks”",
  grocery_sparkles: "Added something alcoholic to the grocery list",
  admin_detour: "Opened the admin dashboard after joining",
  quote_dwell:
    "On intro page 1 (hero), kept the bottom quote visible for at least 4 seconds",
  landing_deep_scroll: "Scrolled the intro all the way to the name form",
  finish_celebration: "Reached the final Cheers screen",
  swipe_halfway: "Super-liked an activity",
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
  food_title_triple: "Second time’s the charm. Chef’s kiss.",
  grocery_sparkles: "The list just picked up something spirited.",
  admin_detour: "Dashboard detour: the plot thickens.",
  quote_dwell: "Four seconds on the opening page — the quote bar noticed.",
  landing_deep_scroll: "Intro? Completed it, mate.",
  finish_celebration: "You made it to the big finish.",
  swipe_halfway: "Straight to the top shelf—that super like counted.",
};

export function easterEggToastLine(key: EasterEggKey): string {
  return TOAST_LINES[key];
}

/** Cryptic hint shown when the guest taps a nearby mystery box (not the toast line). */
const MYSTERY_HINTS: Record<EasterEggKey, string> = {
  legacy_line:
    "The very first whisper of the weekend hides in plain sight—look for the ribbon of words above the golden name.",
  dog_double_tap: "Some smiles answer only when you knock twice, briskly, where the frame meets the glow.",
  card_down_swipe: "Not every card reads top-to-bottom; one direction is a door the manual never mentions.",
  food_title_triple: "The banner of feasts enjoys an impatient admirer—call on it twice in haste.",
  grocery_sparkles: "The shared larder remembers when you name something that warms a toast more than a pantry.",
  admin_detour: "Hosts who slip through the side door while still wearing their guest shoes leave a second footprint.",
  quote_dwell: "The first poem at your feet likes to be watched—linger until the sand runs low.",
  landing_deep_scroll: "The prelude has a back room; reach the threshold where names are written, and the path notices.",
  finish_celebration: "The last curtain is not an exit—standing inside it once rings a bell no one else hears.",
  swipe_halfway: "The crown vote, aimed skyward, carries double weight in the ledger of secrets.",
};

export function easterEggMysteryHint(key: EasterEggKey): string {
  return MYSTERY_HINTS[key];
}

/** Heuristic: grocery free-text names a drink that is typically alcoholic (egg trigger). */
const GROCERY_ALCOHOL_RE = new RegExp(
  [
    String.raw`\bwines?\b`,
    String.raw`\ice?\b`,
    String.raw`\smirnoff?\b`,
    String.raw`\sbudweiser?\b`,
    String.raw`\bbeers?\b`,
    String.raw`\bales?\b`,
    String.raw`\blagers?\b`,
    String.raw`\bipas?\b`,
    String.raw`\bstouts?\b`,
    String.raw`\bporters?\b`,
    String.raw`\bvodka\b`,
    String.raw`\bwhisky\b`,
    String.raw`\bwhiskey\b`,
    String.raw`\bbourbon\b`,
    String.raw`\bscotch\b`,
    String.raw`\brum\b`,
    String.raw`\bgin\b`,
    String.raw`\btequila\b`,
    String.raw`\bmezcal\b`,
    String.raw`\bchampagne\b`,
    String.raw`\bprosecco\b`,
    String.raw`\bcava\b`,
    String.raw`\bsake\b`,
    String.raw`\bcognac\b`,
    String.raw`\bbrandy\b`,
    String.raw`\bvermouth\b`,
    String.raw`\bliqueur\b`,
    String.raw`\babsinthe\b`,
    String.raw`\bciders?\b`,
    String.raw`\bsangria\b`,
    String.raw`\bmargarita\b`,
    String.raw`\bmartini\b`,
    String.raw`\bmimosa\b`,
    String.raw`\bmoscato\b`,
    String.raw`\bmerlot\b`,
    String.raw`\bcabernet\b`,
    String.raw`\bchardonnay\b`,
    String.raw`\briesling\b`,
    String.raw`\bzinfandel\b`,
    String.raw`\bmalbec\b`,
    String.raw`\bsauvignon\b`,
    String.raw`\bpinot\b`,
    String.raw`\brose\b`,
    String.raw`\balcohol\b`,
    String.raw`\bliquor\b`,
    String.raw`\bbooze\b`,
    String.raw`\bspirits?\b`,
    String.raw`\bhard\s+seltzer\b`,
    String.raw`\bwhite\s+claw\b`,
    String.raw`\bport\b`,
    String.raw`\bsherry\b`,
    String.raw`\bamaretto\b`,
    String.raw`\bkahlua\b`,
    String.raw`\baperol\b`,
    String.raw`\bcampari\b`,
    String.raw`\bsoju\b`,
    String.raw`\bgrappa\b`,
    String.raw`\bmulled\s+wine\b`,
    String.raw`\bsparkling\s+wine\b`,
  ].join("|"),
  "i",
);

export function groceryItemMentionsAlcohol(raw: string): boolean {
  const t = raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}+/gu, "");
  if (!t) return false;
  return GROCERY_ALCOHOL_RE.test(t);
}

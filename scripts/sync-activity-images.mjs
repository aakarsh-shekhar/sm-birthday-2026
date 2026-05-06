/**
 * Copies activity photos from `CenterParcs ACTIVITIES/` into
 * `public/activity-images/center-parcs/<slug>.<ext>`.
 *
 * Run: node scripts/sync-activity-images.mjs
 */
import { copyFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const SRC = join(root, "CenterParcs ACTIVITIES");
const DEST = join(root, "public", "activity-images", "center-parcs");

function slug(title) {
  return title
    .toLowerCase()
    .replace(/:/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** [activityTitle, sourceFilenameInSrcDir, optionalOverrideExt] */
const PAIRS = [
  ["E-bike Rental", "E-bike Rental.jpg.avif"],
  ["Kickbike E-Scooter Rental", "Kickbike E-Scooter Rental.jpg.avif"],
  ["E-car Rental (4/6 people)", "E-car Rental (4:6 people).jpg.avif"],
  ["Bicycle Rental", "Bicycle Rental.jpg.avif"],
  ["Mountain Bike Rental", "Bicycle Rental.jpg.avif"],
  ["Adventure Foot Golf", "Adventure Foot Golf.jpg.webp"],
  ["Badminton", "Badminton.jpg.avif"],
  ["Climbing Paradise", "Climbing Paradise.jpg.avif"],
  ["Escape Room - Time Traveler", "Escape Room - Time Traveler.jpg.avif"],
  ["Escape Room - Great Robbery", "Escape Room - Great Robbery.jpg.avif"],
  ["Family Laser Battle", "Family Laser Battle.jpg.avif"],
  ["Squash", "Squash.jpg.avif"],
  ["Jungle Dome", "Jungle Dome.jpg.webp"],
  ["Fishing", "Fishing.jpg.avif"],
  ["Animal Care", "Animal Care.jpg.avif"],
  ["Table Tennis", "Table Tennis.jpg.avif"],
  ["Playground", "Playground.jpg.webp"],
  ["Sport Match Broadcast", "Sport Match Broadcast.webp"],
  ["Digital Nature Discovery", "Digital Nature Discovery.jpg"],
  ["Petting Zoo", "Petting Zoo.jpg.avif"],
  ["Family Board Game Package", "Family Board Game Package.jpg.avif"],
  ["Chill Tunes: Live", "Chill Tunes Live.jpg.webp"],
  ["Family Game Battle", "Family Game Battle.jpg.avif"],
  ["Dive Introduction", "Dive Introduction.jpg.avif"],
  ["Snorkelling Pool", "Wave Pool.jpg.avif"],
  ["Duo Racer", "Duo Racer.jpg.webp"],
  ["Hot Tubs", "Hot Tubs.jpg.avif"],
  ["Wave Pool", "Wave Pool.jpg.avif"],
  ["Whitewater Course", "Whitewater Course.jpg.avif"],
  ["Water Slides", "Water Slides.jpg.webp"],
  ["Outdoor Heated Pool", "Outdoor Heated Pool.jpg.avif"],
  ["Crazy Bingo Game", "Crazy Bingo Game.jpg.avif"],
  ["Live Entertainment", "Live Entertainment.jpg.avif"],
  ["Live Music", "Live Music.jpg.avif"],
  ["Family Quiz Night", "Family Quiz Night.jpg.webp"],
  ["Night Out", "Night Out.jpg.webp"],
  ["Arovite Wellness and Beauty", "Arovite Wellness and Beauty.jpg.avif"],
];

function extFromSource(filename) {
  const base = filename.split("/").pop() ?? filename;
  if (base.endsWith(".avif")) return "avif";
  if (base.endsWith(".webp")) return "webp";
  if (base.endsWith(".jpg")) return "jpg";
  throw new Error(`Unknown extension for ${filename}`);
}

if (!existsSync(SRC)) {
  console.error("Missing folder:", SRC);
  process.exit(1);
}

mkdirSync(DEST, { recursive: true });

let copied = 0;
for (const [title, sourceName] of PAIRS) {
  const from = join(SRC, sourceName);
  if (!existsSync(from)) {
    console.error("Missing source file:", from);
    process.exit(1);
  }
  const ext = extFromSource(sourceName);
  const destName = `${slug(title)}.${ext}`;
  const to = join(DEST, destName);
  copyFileSync(from, to);
  copied += 1;
  console.log(destName, "<-", sourceName);
}

console.log(`\nCopied ${copied} files to ${DEST}`);

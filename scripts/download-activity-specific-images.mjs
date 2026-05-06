import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const ACTIVITIES_PATH = path.join(ROOT, "lib", "activities.ts");
const OUTPUT_DIR = path.join(ROOT, "public", "activity-images");

const SOURCE_BY_TITLE = {
  "Aqua Mundo": "https://www.centerparcs.nl/imageserver?image=cp-map-aqua-mundo-heijderbos",
  "Wild Water Rapids": "https://www.centerparcs.eu/interhome/wild-water-rapids.jpg",
  "Duo Racer Slide": "https://www.centerparcs.eu/interhome/duo-racer.jpg",
  "Snorkeling Pool": "https://www.centerparcs.eu/interhome/snorkeling-pool.jpg",
  "Kids Diving Introduction": "https://www.centerparcs.eu/interhome/kids-diving.jpg",
  "Jungle Dome": "https://www.centerparcs.eu/interhome/jungle-dome.jpg",
  "Action Factory": "https://www.centerparcs.eu/interhome/action-factory.jpg",
  "High Adventure Experience": "https://www.centerparcs.eu/interhome/high-adventure.jpg",
  "Zip Wire": "https://www.centerparcs.eu/interhome/zipwire.jpg",
  "Climbing Tower": "https://www.centerparcs.eu/interhome/climbing-tower.jpg",
  Archery: "https://www.centerparcs.eu/interhome/archery.jpg",
  Bowling: "https://www.centerparcs.eu/interhome/bowling.jpg",
  "Escape Room": "https://www.centerparcs.eu/interhome/escape-room.jpg",
  "Laser Battle": "https://www.centerparcs.eu/interhome/laser-battle.jpg",
  "Adventure Golf": "https://www.centerparcs.eu/interhome/adventure-golf.jpg",
  "Cycle Center": "https://www.centerparcs.eu/interhome/cycle-center.jpg",
  "Nature Walks": "https://www.centerparcs.eu/interhome/nature-walks.jpg",
  "Spa & Wellness": "https://www.centerparcs.eu/interhome/spa-wellness.jpg",
  "Live Entertainment": "https://www.centerparcs.eu/interhome/live-entertainment.jpg",
  Workshops: "https://www.centerparcs.eu/interhome/workshops.jpg",
};

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function extensionFrom(contentType, url) {
  if (contentType?.includes("png")) return ".png";
  if (contentType?.includes("webp")) return ".webp";
  if (contentType?.includes("jpeg") || contentType?.includes("jpg")) return ".jpg";
  if (contentType?.includes("svg")) return ".svg";
  if (contentType?.includes("gif")) return ".gif";

  try {
    const pathname = new URL(url).pathname.toLowerCase();
    if (pathname.endsWith(".png")) return ".png";
    if (pathname.endsWith(".webp")) return ".webp";
    if (pathname.endsWith(".svg")) return ".svg";
    if (pathname.endsWith(".gif")) return ".gif";
  } catch {
    // ignore parse errors
  }
  return ".jpg";
}

async function fetchImage(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      referer: "https://www.centerparcs.eu/",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  const contentType = response.headers.get("content-type");
  const buffer = Buffer.from(await response.arrayBuffer());
  return { contentType, buffer };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  let activitiesSource = await fs.readFile(ACTIVITIES_PATH, "utf8");

  for (const [title, remoteUrl] of Object.entries(SOURCE_BY_TITLE)) {
    try {
      const { contentType, buffer } = await fetchImage(remoteUrl);
      const extension = extensionFrom(contentType, remoteUrl);
      const fileName = `${slugify(title)}${extension}`;
      const localPath = `/activity-images/${fileName}`;
      await fs.writeFile(path.join(OUTPUT_DIR, fileName), buffer);

      const titleEscaped = escapeRegExp(`title: "${title}"`);
      const blockRegex = new RegExp(
        `(${titleEscaped}[\\s\\S]*?imageUrl:\\s*")([^"]+)(")`,
        "m",
      );
      activitiesSource = activitiesSource.replace(blockRegex, `$1${localPath}$3`);
      console.log(`Updated ${title} -> ${localPath}`);
    } catch (error) {
      console.warn(`Failed ${title}: ${String(error)}`);
    }
  }

  await fs.writeFile(ACTIVITIES_PATH, activitiesSource, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

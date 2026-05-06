import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const ACTIVITIES_PATH = path.join(ROOT, "lib", "activities.ts");
const OUTPUT_DIR = path.join(ROOT, "public", "activity-images");

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function fetchScreenshot(targetUrl) {
  const screenshotUrl = `https://image.thum.io/get/width/1280/crop/720/noanimate/${targetUrl}`;
  const response = await fetch(screenshotUrl, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Screenshot fetch failed: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("image")) {
    throw new Error(`Unexpected content type: ${contentType}`);
  }

  const extension = contentType.includes("png") ? ".png" : ".jpg";
  const buffer = Buffer.from(await response.arrayBuffer());
  return { buffer, extension };
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  let source = await fs.readFile(ACTIVITIES_PATH, "utf8");

  const blocks = [...source.matchAll(/\{[\s\S]*?title:\s*"([^"]+)"[\s\S]*?activityUrl:\s*"([^"]+)"[\s\S]*?\},/g)];

  for (const match of blocks) {
    const [fullBlock, title, activityUrl] = match;
    try {
      const { buffer, extension } = await fetchScreenshot(activityUrl);
      const fileName = `${slugify(title)}${extension}`;
      const localPath = `/activity-images/${fileName}`;

      await fs.writeFile(path.join(OUTPUT_DIR, fileName), buffer);
      const updatedBlock = fullBlock.replace(/imageUrl:\s*"[^"]*"/, `imageUrl: "${localPath}"`);
      source = source.replace(fullBlock, updatedBlock);
      console.log(`Saved screenshot for ${title} -> ${localPath}`);
    } catch (error) {
      console.warn(`Failed screenshot for ${title}: ${String(error)}`);
    }
  }

  await fs.writeFile(ACTIVITIES_PATH, source, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

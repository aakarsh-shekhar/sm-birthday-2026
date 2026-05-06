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

function extractImageUrl(html, pageUrl) {
  const patterns = [
    /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<link[^>]*rel=["']image_src["'][^>]*href=["']([^"']+)["'][^>]*>/i,
    /<img[^>]*src=["']([^"']+)["'][^>]*>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      try {
        return new URL(match[1], pageUrl).toString();
      } catch {
        return null;
      }
    }
  }

  return null;
}

function extensionFrom(imageUrl, contentType) {
  if (contentType?.includes("png")) return ".png";
  if (contentType?.includes("webp")) return ".webp";
  if (contentType?.includes("jpeg") || contentType?.includes("jpg")) return ".jpg";
  if (contentType?.includes("gif")) return ".gif";

  try {
    const pathname = new URL(imageUrl).pathname.toLowerCase();
    if (pathname.endsWith(".png")) return ".png";
    if (pathname.endsWith(".webp")) return ".webp";
    if (pathname.endsWith(".gif")) return ".gif";
  } catch {
    // no-op
  }

  return ".jpg";
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

async function fetchImage(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      referer: "https://www.centerparcs.nl/",
    },
    redirect: "follow",
  });
  if (!response.ok) {
    throw new Error(`Failed image fetch ${url}: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return { buffer, contentType: response.headers.get("content-type") };
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  let content = await fs.readFile(ACTIVITIES_PATH, "utf8");

  const objectRegex = /\{\n([\s\S]*?)\n  \},/g;
  const blocks = [...content.matchAll(objectRegex)];
  const pageImageCache = new Map();

  for (const blockMatch of blocks) {
    const fullBlock = blockMatch[0];
    const titleMatch = fullBlock.match(/title:\s*"([^"]+)"/);
    const urlMatch = fullBlock.match(/activityUrl:\s*"([^"]+)"/);
    if (!titleMatch || !urlMatch) continue;

    const title = titleMatch[1];
    const activityUrl = urlMatch[1];
    const slug = slugify(title);

    let pageImageUrl = pageImageCache.get(activityUrl);
    if (!pageImageUrl) {
      try {
        const html = await fetchText(activityUrl);
        pageImageUrl = extractImageUrl(html, activityUrl);
      } catch (error) {
        console.warn(`Could not scrape ${activityUrl}: ${String(error)}`);
        pageImageUrl = null;
      }
      pageImageCache.set(activityUrl, pageImageUrl);
    }

    if (!pageImageUrl) {
      console.warn(`No image found on page for: ${title}`);
      continue;
    }

    try {
      const { buffer, contentType } = await fetchImage(pageImageUrl);
      const extension = extensionFrom(pageImageUrl, contentType);
      const fileName = `${slug}${extension}`;
      const filePath = path.join(OUTPUT_DIR, fileName);
      await fs.writeFile(filePath, buffer);
      const localPath = `/activity-images/${fileName}`;

      const updatedBlock = fullBlock.replace(
        /imageUrl:\s*"[^"]+"/,
        `imageUrl: "${localPath}"`,
      );

      content = content.replace(fullBlock, updatedBlock);
      console.log(`Saved ${title} -> ${localPath}`);
    } catch (error) {
      console.warn(`Could not download image for ${title}: ${String(error)}`);
    }
  }

  await fs.writeFile(ACTIVITIES_PATH, content, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

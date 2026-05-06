import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

const uploadDir = path.join(process.cwd(), "public", "activity-images");

/** Vercel serverless request bodies are limited to ~4.5MB including multipart overhead. */
const MAX_UPLOAD_BYTES = 4_300_000;

function extFromType(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  if (type === "image/svg+xml") return "svg";
  return "jpg";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are supported." }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        {
          error: `Image too large (${Math.round(file.size / 1e6)}MB). Maximum is about 4MB including hosting limits—use a smaller image or export as JPEG.`,
        },
        { status: 413 },
      );
    }

    const extension = extFromType(file.type);
    const name = `upload-${Date.now()}-${randomUUID()}.${extension}`;
    const targetPath = path.join(uploadDir, name);

    await fs.mkdir(uploadDir, { recursive: true });
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(targetPath, Buffer.from(arrayBuffer));

    return NextResponse.json({ imageUrl: `/activity-images/${name}` });
  } catch (error) {
    console.error("Image upload failed", error);
    return NextResponse.json({ error: "Could not upload image." }, { status: 500 });
  }
}

/**
 * Shrinks large images in the browser before POSTing to `/api/admin/upload-image`.
 * Vercel serverless requests are limited to ~4.5MB; phone photos are often much larger.
 */
const TARGET_MAX_BYTES = 3_400_000;

export async function compressImageForAdminUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }
  if (file.size <= TARGET_MAX_BYTES) {
    return file;
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "upload";

  try {
    const bitmap = await createImageBitmap(file);
    let maxDimension = 2048;

    for (let pass = 0; pass < 5; pass++) {
      let width = bitmap.width;
      let height = bitmap.height;
      const maxSide = Math.max(width, height);
      if (maxSide > maxDimension) {
        const scale = maxDimension / maxSide;
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        bitmap.close();
        return file;
      }
      ctx.drawImage(bitmap, 0, 0, width, height);

      let quality = 0.9;
      for (let attempt = 0; attempt < 12; attempt++) {
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), "image/jpeg", quality);
        });
        if (blob && blob.size <= TARGET_MAX_BYTES) {
          bitmap.close();
          return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
        }
        quality -= 0.07;
        if (quality < 0.32) {
          break;
        }
      }

      maxDimension = Math.round(maxDimension * 0.75);
      if (maxDimension < 480) {
        break;
      }
    }

    bitmap.close();
  } catch {
    // Fall through — let upload fail with a clear server message if needed.
  }

  return file;
}

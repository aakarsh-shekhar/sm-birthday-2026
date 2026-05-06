/** Stable URL segment for activity card images under `public/activity-images/center-parcs/`. */
export function slugifyActivityTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/:/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export type ActivityImageFormat = "avif" | "webp" | "jpg";

export function activityImageUrl(title: string, format: ActivityImageFormat): string {
  return `/activity-images/center-parcs/${slugifyActivityTitle(title)}.${format}`;
}

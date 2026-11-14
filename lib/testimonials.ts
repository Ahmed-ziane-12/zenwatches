// Testimonial screenshots live in the public Supabase Storage bucket
// "testimonials". This module is server-only: listing and URLs use the service key.
import "server-only";
import path from "path";
import { getSupabase } from "./supabase";

export const TESTIMONIAL_BUCKET = "testimonials";

const MAX_LISTED_IMAGES = 1000;
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);

export interface TestimonialImage {
  name: string;
  url: string;
  size: number;
  modifiedAt: string;
}

/** True only for a bare image filename, never a path or a hidden file. */
export function isTestimonialImageName(name: string): boolean {
  const base = path.basename(name);
  if (base !== name || base.startsWith(".") || base === ".emptyFolderPlaceholder") {
    return false;
  }
  return IMAGE_EXTENSIONS.has(path.extname(base).toLowerCase());
}

export function testimonialUrl(name: string): string {
  return getSupabase().storage.from(TESTIMONIAL_BUCKET).getPublicUrl(name).data.publicUrl;
}

/**
 * Lists the screenshots in the bucket, newest first, so a freshly uploaded
 * testimonial becomes the featured one.
 */
export async function listTestimonialImages(): Promise<TestimonialImage[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.storage.from(TESTIMONIAL_BUCKET).list("", {
      limit: MAX_LISTED_IMAGES,
      sortBy: { column: "created_at", order: "desc" },
    });

    if (error) {
      console.error("[testimonials] could not list bucket:", error);
      return [];
    }

    return (data ?? [])
      .filter((object) => {
        if (!isTestimonialImageName(object.name)) return false;
        const mime = object.metadata?.mimetype;
        return !mime || mime.startsWith("image/");
      })
      .map((object) => ({
        name: object.name,
        url: supabase.storage.from(TESTIMONIAL_BUCKET).getPublicUrl(object.name).data
          .publicUrl,
        size: Number(object.metadata?.size ?? 0),
        modifiedAt:
          object.updated_at || object.created_at || new Date(0).toISOString(),
      }))
      .sort(
        (a, b) =>
          new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime() ||
          a.name.localeCompare(b.name),
      );
  } catch (error) {
    console.error("[testimonials] could not read the testimonials bucket:", error);
    return [];
  }
}

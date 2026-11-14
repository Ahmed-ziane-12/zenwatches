import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import path from "path";
import { getSupabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";
import {
  TESTIMONIAL_BUCKET,
  isTestimonialImageName,
  listTestimonialImages,
  testimonialUrl,
} from "@/lib/testimonials";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The bucket enforces 10 MB too; this check gives a clearer error before uploading.
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);

/** Maps an uploaded file to a safe extension, or null when it is not an image. */
function extensionFor(file: File): string | null {
  const fromName = path.extname(file.name).toLowerCase();
  if (ALLOWED_EXTENSIONS.has(fromName)) {
    return fromName === ".jpeg" ? ".jpg" : fromName;
  }

  const fromType = (file.type.split("/")[1] || "").toLowerCase();
  const normalized = fromType === "jpeg" ? "jpg" : fromType;
  return ALLOWED_EXTENSIONS.has(`.${normalized}`) ? `.${normalized}` : null;
}

/** Keeps uploads recognisable in the bucket without trusting the client filename. */
function safeBaseName(name: string): string {
  const base = path
    .basename(name, path.extname(name))
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase()
    .slice(0, 40);
  return base || "testimonial";
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  return NextResponse.json({ images: await listTestimonialImages() }, { status: 200 });
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const formData = await request.formData();
    const entries = [...formData.getAll("files"), ...formData.getAll("file")];
    const files = entries.filter(
      (entry): entry is File => entry instanceof File && entry.size > 0,
    );

    if (files.length === 0) {
      return NextResponse.json({ error: "No images were provided" }, { status: 400 });
    }

    for (const file of files) {
      if (!file.type.startsWith("image/") || !extensionFor(file)) {
        return NextResponse.json(
          { error: `${file.name || "File"} is not a supported image` },
          { status: 400 },
        );
      }
      if (file.size > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          { error: `${file.name || "Image"} is larger than 10 MB` },
          { status: 400 },
        );
      }
    }

    const supabase = getSupabase();
    const bucket = supabase.storage.from(TESTIMONIAL_BUCKET);
    const created: string[] = [];

    for (const [index, file] of files.entries()) {
      const extension = extensionFor(file);
      if (!extension) continue;

      const name = `${safeBaseName(file.name)}-${Date.now()}-${index}-${randomUUID().slice(
        0,
        8,
      )}${extension}`;
      const { error } = await bucket.upload(name, await file.arrayBuffer(), {
        contentType: file.type || "application/octet-stream",
        // Short cache so a deleted screenshot stops being served from the CDN quickly.
        cacheControl: "60",
        upsert: false,
      });

      if (error) {
        // Do not leave a partial batch behind if one upload fails.
        if (created.length > 0) await bucket.remove(created);
        console.error("[api/dashboard/testimonials] upload error:", error);
        return NextResponse.json(
          { error: error.message || "Could not upload images" },
          { status: 500 },
        );
      }

      created.push(name);
    }

    return NextResponse.json(
      {
        images: await listTestimonialImages(),
        uploaded: created.map((name) => ({ name, url: testimonialUrl(name) })),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[api/dashboard/testimonials] upload error:", error);
    return NextResponse.json({ error: "Could not upload images" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    let name = new URL(request.url).searchParams.get("name") ?? "";
    const contentType = request.headers.get("content-type") ?? "";

    if (!name && contentType.includes("application/json")) {
      const body = await request.json().catch(() => ({}));
      name = typeof body?.name === "string" ? body.name : "";
    }

    name = name.trim();

    // Only bare, known image filenames at the bucket root. This rejects
    // separators, "..", hidden files and anything that is not an image.
    if (!name || !isTestimonialImageName(name) || path.basename(name) !== name) {
      return NextResponse.json({ error: "Invalid image name" }, { status: 400 });
    }

    const supabase = getSupabase();
    const bucket = supabase.storage.from(TESTIMONIAL_BUCKET);

    const { data: matches, error: listError } = await bucket.list("", {
      limit: 1000,
      search: name,
    });
    if (listError) {
      console.error("[api/dashboard/testimonials] lookup error:", listError);
      return NextResponse.json({ error: "Could not delete image" }, { status: 500 });
    }
    if (!matches?.some((object) => object.name === name)) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const { error } = await bucket.remove([name]);
    if (error) {
      console.error("[api/dashboard/testimonials] delete error:", error);
      return NextResponse.json({ error: "Could not delete image" }, { status: 500 });
    }

    return NextResponse.json({ images: await listTestimonialImages() }, { status: 200 });
  } catch (error) {
    console.error("[api/dashboard/testimonials] delete error:", error);
    return NextResponse.json({ error: "Could not delete image" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSupabase } from "@/lib/supabase";
import {
  MAX_IMAGE_BYTES,
  MAX_PRODUCT_IMAGES,
  PRODUCT_IMAGE_BUCKET,
  normalizeImages,
  storagePathFromUrl,
  toAdminProduct,
} from "@/lib/product-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function safeExtension(name: string, type: string): string {
  const fromName = name.split(".").pop()?.toLowerCase() ?? "";
  if (/^[a-z0-9]{2,5}$/.test(fromName)) return fromName;

  const fromType = type.split("/").pop()?.toLowerCase() ?? "";
  if (fromType === "jpeg") return "jpg";
  if (fromType === "svg+xml") return "svg";
  if (/^[a-z0-9]{2,5}$/.test(fromType)) return fromType;
  return "jpg";
}

async function loadProduct(id: number) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("image, images")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as { image: string | null; images: unknown } | null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

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
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: `${file.name || "File"} is not an image` },
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

    const current = await loadProduct(id);
    if (!current) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const currentImages = normalizeImages(current);
    const remainingSlots = MAX_PRODUCT_IMAGES - currentImages.length;
    if (remainingSlots <= 0) {
      return NextResponse.json(
        { error: `A product can have at most ${MAX_PRODUCT_IMAGES} images` },
        { status: 400 },
      );
    }
    if (files.length > remainingSlots) {
      return NextResponse.json(
        {
          error: `You can upload ${remainingSlots} more image${
            remainingSlots === 1 ? "" : "s"
          } for this product.`,
        },
        { status: 400 },
      );
    }

    const supabase = getSupabase();
    const uploadedPaths: string[] = [];
    const uploadedUrls: string[] = [];

    for (const [index, file] of files.slice(0, remainingSlots).entries()) {
      const extension = safeExtension(file.name, file.type);
      const path = `${id}/${Date.now()}-${index}-${randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from(PRODUCT_IMAGE_BUCKET)
        .upload(path, file, {
          contentType: file.type || "application/octet-stream",
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        if (uploadedPaths.length > 0) {
          await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove(uploadedPaths);
        }
        console.error("[api/dashboard/products/:id/images] upload error:", uploadError);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
      }

      const { data: publicUrl } = supabase.storage
        .from(PRODUCT_IMAGE_BUCKET)
        .getPublicUrl(path);

      uploadedPaths.push(path);
      uploadedUrls.push(publicUrl.publicUrl);
    }

    const nextImages = [...currentImages, ...uploadedUrls];
    const { data: updated, error: updateError } = await supabase
      .from("products")
      .update({ images: nextImages, image: nextImages[0] ?? null })
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (updateError || !updated) {
      await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove(uploadedPaths);
      console.error("[api/dashboard/products/:id/images] update error:", updateError);
      return NextResponse.json({ error: "Failed to save image" }, { status: 500 });
    }

    return NextResponse.json(
      {
        product: toAdminProduct(updated as Record<string, unknown>),
        uploaded: uploadedUrls,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[api/dashboard/products/:id/images] upload error:", error);
    return NextResponse.json({ error: "Could not upload image" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  try {
    let image = "";
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const body = await request.json().catch(() => ({}));
      image = typeof body?.image === "string" ? body.image : "";
    }

    if (!image) {
      image = new URL(request.url).searchParams.get("image") ?? "";
    }

    image = image.trim();
    if (!image) {
      return NextResponse.json({ error: "Missing image" }, { status: 400 });
    }

    const current = await loadProduct(id);
    if (!current) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const currentImages = normalizeImages(current);
    if (!currentImages.includes(image)) {
      return NextResponse.json({ error: "Image not found on this product" }, { status: 404 });
    }

    const nextImages = currentImages.filter((entry) => entry !== image);
    const supabase = getSupabase();
    const { data: updated, error: updateError } = await supabase
      .from("products")
      .update({ images: nextImages, image: nextImages[0] ?? null })
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (updateError || !updated) {
      console.error("[api/dashboard/products/:id/images] delete update error:", updateError);
      return NextResponse.json({ error: "Failed to remove image" }, { status: 500 });
    }

    const storagePath = storagePathFromUrl(image);
    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from(PRODUCT_IMAGE_BUCKET)
        .remove([storagePath]);
      if (storageError) {
        console.warn(
          "[api/dashboard/products/:id/images] storage delete failed:",
          storageError,
        );
      }
    }

    return NextResponse.json(
      { product: toAdminProduct(updated as Record<string, unknown>) },
      { status: 200 },
    );
  } catch (error) {
    console.error("[api/dashboard/products/:id/images] delete error:", error);
    return NextResponse.json({ error: "Could not remove image" }, { status: 500 });
  }
}

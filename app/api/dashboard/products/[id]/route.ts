import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";
import {
  PRODUCT_IMAGE_BUCKET,
  normalizeImages,
  parseProductInput,
  storagePathFromUrl,
  toAdminProduct,
} from "@/lib/product-admin";
import { persistAvailability, revalidateStorefront } from "@/lib/product-write";

export const dynamic = "force-dynamic";

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("[api/dashboard/products/:id] read error:", error);
      return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      { product: toAdminProduct(data as Record<string, unknown>) },
      { status: 200 },
    );
  } catch (error) {
    console.error("[api/dashboard/products/:id] read error:", error);
    return NextResponse.json({ error: "Could not fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsed = parseProductInput(body);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("products")
      .update(parsed.data)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("[api/dashboard/products/:id] update error:", error);
      return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let row = data as Record<string, unknown>;

    // The stock trigger may have overwritten the admin's availability choice.
    if (row.availability !== parsed.data.availability) {
      const applied = await persistAvailability(supabase, id, parsed.data.availability);
      if (applied.error) {
        console.error(
          "[api/dashboard/products/:id] availability error:",
          applied.error,
        );
        return NextResponse.json(
          { error: "Product saved, but its availability could not be set" },
          { status: 500 },
        );
      }
      if (applied.row) row = applied.row;
    }

    revalidateStorefront();

    return NextResponse.json(
      { product: toAdminProduct(row) },
      { status: 200 },
    );
  } catch (error) {
    console.error("[api/dashboard/products/:id] update error:", error);
    return NextResponse.json({ error: "Could not update product" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const { data: current, error: readError } = await supabase
      .from("products")
      .select("image, images")
      .eq("id", id)
      .maybeSingle();

    if (readError) {
      console.error("[api/dashboard/products/:id] delete read error:", readError);
      return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
    if (!current) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("[api/dashboard/products/:id] delete error:", error);
      if (error.code === "23503") {
        return NextResponse.json(
          {
            error:
              "This product is linked to existing orders. Hide it instead of deleting it.",
          },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }

    // Only storage objects that belong to our bucket can be removed. Local
    // /public images are left untouched.
    const paths = normalizeImages(current as Record<string, unknown>)
      .map((image) => storagePathFromUrl(image))
      .filter((path): path is string => Boolean(path));

    if (paths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from(PRODUCT_IMAGE_BUCKET)
        .remove(paths);
      if (storageError) {
        console.warn("[api/dashboard/products/:id] storage cleanup failed:", storageError);
      }
    }

    revalidateStorefront();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[api/dashboard/products/:id] delete error:", error);
    return NextResponse.json({ error: "Could not delete product" }, { status: 500 });
  }
}

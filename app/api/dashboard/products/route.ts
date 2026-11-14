import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";
import { parseProductInput, toAdminProduct } from "@/lib/product-admin";
import { persistAvailability, revalidateStorefront } from "@/lib/product-write";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      console.error("[api/dashboard/products] list error:", error);
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }

    return NextResponse.json(
      { products: (data ?? []).map((row) => toAdminProduct(row as Record<string, unknown>)) },
      { status: 200 },
    );
  } catch (error) {
    console.error("[api/dashboard/products] list error:", error);
    return NextResponse.json({ error: "Could not fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const parsed = parseProductInput(body);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("products")
      .insert({
        ...parsed.data,
        image: null,
        images: [],
      })
      .select("*")
      .single();

    if (error) {
      console.error("[api/dashboard/products] create error:", error);
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }

    let row = data as Record<string, unknown>;

    // The stock trigger may have overwritten the admin's availability choice.
    if (row.availability !== parsed.data.availability) {
      const applied = await persistAvailability(
        supabase,
        Number(row.id),
        parsed.data.availability,
      );
      if (applied.error) {
        console.error("[api/dashboard/products] availability error:", applied.error);
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
      { status: 201 },
    );
  } catch (error) {
    console.error("[api/dashboard/products] create error:", error);
    return NextResponse.json({ error: "Could not create product" }, { status: 500 });
  }
}

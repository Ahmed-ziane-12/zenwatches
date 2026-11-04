import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { parseProductInput, toAdminProduct } from "@/lib/product-admin";

export const dynamic = "force-dynamic";

export async function GET() {
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

    return NextResponse.json(
      { product: toAdminProduct(data as Record<string, unknown>) },
      { status: 201 },
    );
  } catch (error) {
    console.error("[api/dashboard/products] create error:", error);
    return NextResponse.json({ error: "Could not create product" }, { status: 500 });
  }
}

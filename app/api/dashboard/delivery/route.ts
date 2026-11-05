import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { loadDelivery } from "@/lib/delivery-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PRICE = 1_000_000;
const MAX_OFFICES = 100;
const MAX_OFFICE_LENGTH = 120;

function normalizeOffices(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;

  const seen = new Set<string>();
  const offices: string[] = [];

  for (const entry of value) {
    if (typeof entry !== "string") return null;
    const office = entry.trim();
    if (!office) continue;
    if (office.length > MAX_OFFICE_LENGTH) return null;
    if (seen.has(office)) continue;
    seen.add(office);
    offices.push(office);
  }

  if (offices.length > MAX_OFFICES) return null;
  return offices;
}

function normalizePrice(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const price = Number(value);
  if (!Number.isFinite(price) || !Number.isInteger(price)) return null;
  if (price < 0 || price > MAX_PRICE) return null;
  return price;
}

export async function GET() {
  try {
    const data = await loadDelivery();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[api/dashboard/delivery] read error:", error);
    return NextResponse.json({ error: "Could not read delivery data" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const wilaya = typeof body?.wilaya === "string" ? body.wilaya.trim() : "";
    const home = normalizePrice(body?.home);
    const desk = normalizePrice(body?.desk);
    const offices = normalizeOffices(body?.offices);

    if (!wilaya) {
      return NextResponse.json({ error: "Missing wilaya" }, { status: 400 });
    }
    if (home === null || desk === null) {
      return NextResponse.json(
        { error: "Prices must be whole numbers between 0 and 1,000,000" },
        { status: 400 },
      );
    }
    if (offices === null) {
      return NextResponse.json(
        { error: "Offices must be a list of valid names" },
        { status: 400 },
      );
    }

    const supabase = getSupabase();
    const { data: existing, error: findError } = await supabase
      .from("delivery")
      .select("id")
      .eq("wilaya", wilaya)
      .maybeSingle();

    if (findError) throw findError;
    if (!existing) {
      return NextResponse.json({ error: "Unknown wilaya" }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from("delivery")
      .update({ home_price: home, desk_price: desk, desks: offices })
      .eq("wilaya", wilaya);

    if (updateError) throw updateError;

    return NextResponse.json(
      { success: true, ...(await loadDelivery()) },
      { status: 200 },
    );
  } catch (error) {
    console.error("[api/dashboard/delivery] write error:", error);
    return NextResponse.json({ error: "Could not update delivery data" }, { status: 500 });
  }
}

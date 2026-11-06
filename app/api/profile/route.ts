import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getCustomerById } from "@/lib/customer-link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const userId = Number(new URL(request.url).searchParams.get("userId"));

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, username, role, created_at, customer_id")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.role !== "client") {
      return NextResponse.json({ error: "Not a client account" }, { status: 403 });
    }

    const customer = user.customer_id ? await getCustomerById(user.customer_id) : null;

    return NextResponse.json({ user, customer }, { status: 200 });
  } catch (error) {
    console.error("[api/profile] read error:", error);
    return NextResponse.json({ error: "Could not load profile" }, { status: 500 });
  }
}

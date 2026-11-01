import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[api/dashboard/orders]", error);
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error: any) {
    console.error("[api/dashboard/orders]", error);
    return NextResponse.json({ error: "Could not fetch orders" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("[api/dashboard/orders]", error);
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: data }, { status: 200 });
  } catch (error: any) {
    console.error("[api/dashboard/orders]", error);
    return NextResponse.json({ error: "Could not update order" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const supabase = getSupabase();

    // Delete order items first
    await supabase.from("order_items").delete().eq("order_id", orderId);
    
    // Delete order
    const { error } = await supabase.from("orders").delete().eq("id", orderId);

    if (error) {
      console.error("[api/dashboard/orders]", error);
      return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("[api/dashboard/orders]", error);
    return NextResponse.json({ error: "Could not delete order" }, { status: 500 });
  }
}

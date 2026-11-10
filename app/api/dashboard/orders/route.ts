import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { sendCapiEvent } from "@/lib/capi";
import { requireAdmin } from "@/lib/admin-auth";

interface OrderItemRow {
  product_id?: number | string | null;
  quantity?: number | string | null;
  product_name_snapshot?: string | null;
}

interface OrderRow {
  id: number;
  status?: string | null;
  customer_phone?: string | null;
  grand_total?: number | string | null;
  order_items?: OrderItemRow[] | null;
}

/**
 * Reporting-only Meta event, sent once when an order first reaches "delivered".
 * It does not touch the Purchase event or ad optimisation. Deliberately
 * unconditional: the customer already consented when the order was placed.
 */
async function sendDeliveredEvent(request: Request, order: OrderRow) {
  const items = order.order_items ?? [];
  const contents = items
    .filter((item) => item.product_id !== null && item.product_id !== undefined)
    .map((item) => ({
      id: String(item.product_id),
      quantity: Number(item.quantity) || 1,
    }));

  // The dashboard request is the admin's, not the customer's, so the source URL
  // comes from the public site instead of the Referer header.
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    new URL(request.url).origin;

  try {
    const result = await sendCapiEvent({
      name: "OrderDelivered",
      eventId: `delivered_${order.id}`,
      url: `${origin}/`,
      phone: order.customer_phone ?? undefined,
      value: Number(order.grand_total) || 0,
      currency: "DZD",
      contentIds: contents.map((item) => item.id),
      contents,
      contentName: items
        .map((item) => item.product_name_snapshot ?? "")
        .filter(Boolean)
        .join(", ")
        .slice(0, 200),
    });

    if (!result.ok && !result.skipped) {
      console.error("[api/dashboard/orders] OrderDelivered event failed:", result.error);
    }
  } catch (error) {
    // Tracking must never block a status change.
    console.error("[api/dashboard/orders] OrderDelivered event error:", error);
  }
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

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
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data: existingRow, error: readError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .maybeSingle();

    if (readError) {
      console.error("[api/dashboard/orders] read error:", readError);
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
    if (!existingRow) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const existing = existingRow as OrderRow;
    const movingToDelivered = status === "delivered" && existing.status !== "delivered";

    if (movingToDelivered) {
      // Claim the notification exactly once: the update only matches while
      // meta_delivered_at is still null. A repeat click or a second admin gets
      // no row, so no duplicate event is sent.
      const { data: claimed, error: claimError } = await supabase
        .from("orders")
        .update({ status, meta_delivered_at: new Date().toISOString() })
        .eq("id", orderId)
        .is("meta_delivered_at", null)
        .select()
        .maybeSingle();

      if (claimError) {
        // PostgREST reports a missing column as PGRST204; raw Postgres as 42703.
        if (claimError.code !== "42703" && claimError.code !== "PGRST204") {
          console.error("[api/dashboard/orders] delivered claim error:", claimError);
          return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
        }
        // Column not migrated yet: keep status updates working and skip the event.
        console.warn(
          "[api/dashboard/orders] orders.meta_delivered_at is missing; run the migration in docs/meta-integration.md.",
        );
      } else if (claimed) {
        await sendDeliveredEvent(request, {
          ...existing,
          ...(claimed as OrderRow),
          order_items: existing.order_items,
        });
        return NextResponse.json({ success: true, order: claimed }, { status: 200 });
      }
      // No claimed row means the order was already delivered before; fall through
      // and just apply the status.
    }

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
  const denied = await requireAdmin();
  if (denied) return denied;

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

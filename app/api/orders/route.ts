import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { sendCapiEvent } from "@/lib/capi";
import { loadDelivery } from "@/lib/delivery-data";
import type { DeliveryConfig } from "@/lib/delivery-types";
import { linkCustomerToUser, type CustomerRecord } from "@/lib/customer-link";

type DeliveryType = "home" | "desk";

type DeliveryResolution =
  | {
      ok: true;
      deliveryType: DeliveryType;
      wilayaName: string;
      communeName: string;
      shippingCost: number;
    }
  | { ok: false; error: string };

function resolveDelivery(
  config: DeliveryConfig,
  wilaya: unknown,
  commune: unknown,
  deliveryType: unknown,
): DeliveryResolution {
  if (typeof wilaya !== "string" || !config.shippingPrices[wilaya]) {
    return { ok: false, error: "Invalid wilaya" };
  }

  const type: DeliveryType = deliveryType === "home" ? "home" : "desk";
  const communeName = typeof commune === "string" ? commune.trim() : "";

  if (!communeName) {
    return { ok: false, error: "Missing commune" };
  }

  if (type === "desk") {
    const offices = config.officeLocations[wilaya] ?? [];
    if (offices.length === 0) {
      return { ok: false, error: "Stop-desk delivery is not available in this wilaya" };
    }
    if (!offices.includes(communeName)) {
      return { ok: false, error: "Invalid stop-desk location" };
    }
  }

  const prices = config.shippingPrices[wilaya];
  return {
    ok: true,
    deliveryType: type,
    wilayaName: wilaya,
    communeName,
    shippingCost: type === "home" ? prices.home : prices.desk,
  };
}

function cookieValue(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) {
      try {
        return decodeURIComponent(rest.join("="));
      } catch {
        return rest.join("=");
      }
    }
  }
  return undefined;
}

function eventSourceUrl(request: Request): string {
  const referer = request.headers.get("referer");
  if (referer) return referer;
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) return site.replace(/\/+$/, "");
  return new URL(request.url).origin;
}

function trackingAllowed(request: Request): boolean {
  if (process.env.NEXT_PUBLIC_META_CONSENT_REQUIRED !== "true") return true;
  return cookieValue(request, "meta_consent") === "granted";
}

/**
 * Campaign attribution from the landing URL. The `orders.source` column already exists,
 * so UTM values and Meta's click id can be stored without a schema change.
 */
function attributionSource(request: Request): string | undefined {
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const url = new URL(referer);
      const keys = [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_content",
        "utm_term",
        "fbclid",
      ];
      const parts = keys
        .map((key) => {
          const value = url.searchParams.get(key);
          return value ? `${key}=${value}` : null;
        })
        .filter(Boolean);
      if (parts.length > 0) return parts.join("&").slice(0, 300);
    } catch {
      // A malformed referer must not block the order.
    }
  }
  const fbc = cookieValue(request, "_fbc");
  return fbc ? `fbc=${fbc}`.slice(0, 300) : undefined;
}

async function sendPurchaseEvent(request: Request, input: {
  eventId: string;
  phone: string;
  value: number;
  contentIds: string[];
  contents: { id: string; quantity: number }[];
  contentName?: string;
}) {
  if (!trackingAllowed(request)) return;
  try {
    await sendCapiEvent({
      name: "Purchase",
      eventId: input.eventId,
      url: eventSourceUrl(request),
      phone: input.phone,
      fbp: cookieValue(request, "_fbp"),
      fbc: cookieValue(request, "_fbc"),
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      ua: request.headers.get("user-agent") || undefined,
      value: input.value,
      currency: "DZD",
      contentIds: input.contentIds,
      contents: input.contents,
      contentName: input.contentName,
    });
  } catch (error) {
    // Tracking must never break the order.
    console.error("[api/orders] CAPI error", error);
  }
}

/**
 * If a signed-in client skipped phone confirmation on their profile, try to
 * attach their order phone to an existing customers row. Never blocks the order.
 */
async function linkOrderCustomer(
  userId: unknown,
  phone: unknown,
): Promise<CustomerRecord | null> {
  if (userId === null || userId === undefined || userId === "") return null;

  try {
    const result = await linkCustomerToUser({ userId, phone });
    return result.ok ? result.customer : null;
  } catch (error) {
    console.error("[api/orders] customer link error:", error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = getSupabase();

    const {
      fullName,
      phoneNumber,
      wilaya,
      commune,
      deliveryType,
      // signed-in client, when available
      userId,
      // single product order
      quantity,
      color,
      productId,
      // cart order
      items,
    } = body;

    if (!fullName || !phoneNumber || !wilaya) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const deliveryConfig = await loadDelivery();
    const delivery = resolveDelivery(deliveryConfig, wilaya, commune, deliveryType);
    if (!delivery.ok) {
      return NextResponse.json({ error: delivery.error }, { status: 400 });
    }
    const {
      deliveryType: deliveryTypeNormalized,
      wilayaName,
      communeName,
      shippingCost: shippingCostCalc,
    } = delivery;

    // Handle cart order (multiple items)
    if (Array.isArray(items) && items.length > 0) {
      // Fetch all products from DB to validate prices/IDs
      const productIds = items.map((item: any) => Number(item.id) || item.productId).filter(Boolean);
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, name, price")
        .in("id", productIds);

      if (productsError || !products) {
        console.error("[api/orders] products fetch error:", productsError);
        return NextResponse.json({ error: "Invalid products" }, { status: 400 });
      }

      const productMap = new Map(products.map((p: any) => [Number(p.id), p]));
      let productsTotal = 0;
      const validatedItems: any[] = [];

      for (const item of items) {
        const pid = Number(item.id) || Number(item.productId);
        const product = productMap.get(pid);
        if (!product) {
          return NextResponse.json({ error: "Invalid product in cart" }, { status: 400 });
        }
        const qty = Math.max(1, parseInt(item.quantity || item.qty) || 1);
        const unitPrice = Number(product.price) || 0;
        productsTotal += unitPrice * qty;
        validatedItems.push({
          product_id: pid,
          quantity: qty,
          product_name_snapshot: product.name,
          unit_price_at_purchase: unitPrice,
          color: item.color || item.colorLabel || null,
        });
      }

      const grandTotal = productsTotal + shippingCostCalc;

      const orderData: any = {
        customer_name: fullName,
        customer_phone: phoneNumber,
        wilaya: wilayaName,
        delivery_type: deliveryTypeNormalized,
        products_total: productsTotal,
        shipping_cost: shippingCostCalc,
        grand_total: grandTotal,
        status: "new",
      };
      if (communeName) {
        orderData.city = communeName;
      }
      const attribution = attributionSource(request);
      if (attribution) {
        orderData.source = attribution;
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error("[api/orders] order insert error:", orderError);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
      }

      const orderItemsWithOrderId = validatedItems.map((item) => ({
        order_id: order.id,
        ...item,
      }));

      const { error: itemError } = await supabase.from("order_items").insert(orderItemsWithOrderId);

      if (itemError) {
        console.error("[api/orders] order_items insert error:", itemError);
        return NextResponse.json({ error: "Failed to create order items" }, { status: 500 });
      }

      const eventId = `purchase_${order.id}`;
      await sendPurchaseEvent(request, {
        eventId,
        phone: phoneNumber,
        value: grandTotal,
        contentIds: validatedItems.map((item) => String(item.product_id)),
        contents: validatedItems.map((item) => ({
          id: String(item.product_id),
          quantity: item.quantity,
        })),
        contentName: validatedItems
          .map((item) => item.product_name_snapshot)
          .join(", ")
          .slice(0, 200),
      });

      const customer = await linkOrderCustomer(userId, phoneNumber);

      return NextResponse.json({ success: true, order, eventId, customer }, { status: 201 });
    }

    // Handle single product order (backward compatible)
    if (!productId) {
      return NextResponse.json({ error: "Missing productId or items" }, { status: 400 });
    }

    const qty = Math.max(1, parseInt(quantity) || 1);

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, price")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      console.error("[api/orders] product fetch error:", productError);
      return NextResponse.json({ error: "Invalid product" }, { status: 400 });
    }

    const unitPrice = Number(product.price) || 0;
    const productsTotal = unitPrice * qty;
    const grandTotal = productsTotal + shippingCostCalc;

    const orderData: any = {
      customer_name: fullName,
      customer_phone: phoneNumber,
      wilaya: wilayaName,
      delivery_type: deliveryTypeNormalized,
      products_total: productsTotal,
      shipping_cost: shippingCostCalc,
      grand_total: grandTotal,
      status: "new",
    };
    if (communeName) {
      orderData.city = communeName;
    }
    const attribution = attributionSource(request);
    if (attribution) {
      orderData.source = attribution;
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error("[api/orders] order insert error:", orderError);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    const orderItemData: any = {
      order_id: order.id,
      product_id: Number(product.id),
      quantity: qty,
      product_name_snapshot: product.name,
      unit_price_at_purchase: unitPrice,
    };
    if (color) {
      orderItemData.color = color;
    }

    const { error: itemError } = await supabase.from("order_items").insert(orderItemData);

    if (itemError) {
      console.error("[api/orders] order_items insert error:", itemError);
      return NextResponse.json({ error: "Failed to create order items" }, { status: 500 });
    }

    const eventId = `purchase_${order.id}`;
    await sendPurchaseEvent(request, {
      eventId,
      phone: phoneNumber,
      value: grandTotal,
      contentIds: [String(product.id)],
      contents: [{ id: String(product.id), quantity: qty }],
      contentName: product.name,
    });

    const customer = await linkOrderCustomer(userId, phoneNumber);

    return NextResponse.json({ success: true, order, eventId, customer }, { status: 201 });
  } catch (error: any) {
    console.error("[api/orders]", error);
    return NextResponse.json({ error: "Could not process order." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import dz from "geoalgeria";

const STOP_DESK_FEE = 400;
const HOME_DELIVERY_FEE = 600;

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

    const deliveryTypeNormalized = deliveryType === "home" ? "home" : "desk";
    const shippingCostCalc = deliveryTypeNormalized === "home" ? HOME_DELIVERY_FEE : STOP_DESK_FEE;

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

      // Resolve wilaya and commune names
      let wilayaName = wilaya;
      try {
        const wilayaId = parseInt(wilaya);
        const w = dz.wilayas?.find((x: any) => x.code == wilayaId || x.id == wilayaId);
        if (w) {
          wilayaName = (w as any).name_fr || (w as any).name || wilaya;
        }
      } catch {}

      let communeName = commune;
      try {
        if (commune) {
          const wilayaId = parseInt(wilaya);
          const communesList = dz.getCommunesByWilaya(wilayaId);
          const c = communesList?.find((x: any) => x.code_commune == commune || x.id == commune);
          if (c) {
            communeName = (c as any).name_fr || (c as any).name || commune;
          }
        }
      } catch {}

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

      return NextResponse.json({ success: true, order }, { status: 201 });
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

    let wilayaName = wilaya;
    try {
      const wilayaId = parseInt(wilaya);
      const w = dz.wilayas?.find((x: any) => x.code == wilayaId || x.id == wilayaId);
      if (w) {
        wilayaName = (w as any).name_fr || (w as any).name || wilaya;
      }
    } catch {}

    let communeName = commune;
    try {
      if (commune) {
        const wilayaId = parseInt(wilaya);
        const communesList = dz.getCommunesByWilaya(wilayaId);
        const c = communesList?.find((x: any) => x.code_commune == commune || x.id == commune);
        if (c) {
          communeName = (c as any).name_fr || (c as any).name || commune;
        }
      }
    } catch {}

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

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error: any) {
    console.error("[api/orders]", error);
    return NextResponse.json({ error: "Could not process order." }, { status: 500 });
  }
}

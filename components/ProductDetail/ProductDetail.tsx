"use client";

import { useEffect, useMemo, useState } from "react";
import { Product } from "@/lib/products";
import { useCart } from "@/components/CartProvider";
import OrderForm, { OrderFormData } from "@/components/OrderForm/OrderForm";
import styles from "./ProductDetail.module.css";
import Image from "next/image";
import { useLanguage } from "../LanguageProvider";
import { trackInitiateCheckout, trackPurchase, trackViewContent } from "@/lib/meta";
import type { DeliveryConfig } from "@/lib/delivery-types";

type ProductDetailProps = {
  product: Product;
  delivery: DeliveryConfig;
};

/** Local paths need a leading slash; Supabase/CDN URLs must be left untouched. */
function resolveImageSrc(value: string | null | undefined): string {
  if (!value) return "/images/product.jpg";
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:")) return value;
  return value.startsWith("/") ? value : `/${value}`;
}

export default function ProductDetail({ product, delivery }: ProductDetailProps) {
  const { add } = useCart();
  const { t } = useLanguage();
  const p: any = product as any;
  const fallbackImage = "/images/product.jpg";
  const initialImage = resolveImageSrc(
    p.imageUrl || p.image || (Array.isArray(p.images) ? p.images[0] : null) || fallbackImage,
  );
  const [selectedImage, setSelectedImage] = useState(initialImage);
  const images = (
    Array.isArray(p.images) && p.images.length > 0 ? p.images : [selectedImage]
  ).map((image: string) => resolveImageSrc(image));
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const soldOut =
    typeof p.stock === "number" ? p.stock <= 0 : p.availability === "sold-out";

  const productSpecs = useMemo<Record<string, string> | null>(() => {
    const source =
      p.specs && typeof p.specs === "object" && !Array.isArray(p.specs) ? p.specs : {};
    const entries: Record<string, string> = {};

    for (const [key, value] of Object.entries(source)) {
      if (value === null || value === undefined) continue;
      const text = String(value).trim();
      if (text) entries[key] = text;
    }

    for (const [key, value] of [
      ["movement", p.movement],
      ["caseSize", p.caseSize],
      ["waterResistance", p.waterResistance],
    ] as const) {
      if (!entries[key] && value) entries[key] = String(value);
    }

    return Object.keys(entries).length > 0 ? entries : null;
  }, [p.specs, p.movement, p.caseSize, p.waterResistance]);

  useEffect(() => {
    trackViewContent({
      id: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
    });
  }, [product.id, product.name, product.price, product.currency]);

  const handleOrderSubmit = async (data: OrderFormData) => {
    try {
      const productTotal = (product.price || 0) * (data.quantity || 1);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          wilaya: data.wilaya,
          commune: data.commune,
          deliveryType: data.deliveryType,
          quantity: data.quantity,
          color: data.color,
          productId: product.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit order");
      }

      const result = await response.json();
      const order = result.order;
      const orderedTotal = Number(order?.products_total ?? productTotal);
      const shippingCost = Number(order?.shipping_cost ?? 0);
      const grandTotal = Number(order?.grand_total ?? orderedTotal + shippingCost);
      setOrderDetails({
        order,
        formData: data,
        product,
        productTotal: orderedTotal,
        shippingCost,
        grandTotal,
      });
      trackPurchase({
        eventId: result.eventId || `purchase_${order?.id}`,
        value: grandTotal,
        contentIds: [String(product.id)],
        contents: [{ id: String(product.id), quantity: data.quantity || 1 }],
      });
      setOrderSuccess(true);
    } catch (error) {
      console.error("Order submission error:", error);
      alert(t("order.orderSuccess"));
    }
  };

  const handleAddToCart = () => {
    add(product);
    alert(t("order.addedToCart"));
  };

  if (orderSuccess && orderDetails) {
    const { formData, product: orderedProduct, productTotal, shippingCost, grandTotal } = orderDetails;
    const orderTotal = grandTotal ?? formData.totalPrice;
    return (
      <div className={styles.container} style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ padding: "2rem", background: "var(--card)", borderRadius: "12px", border: "1px solid var(--line)" }}>
          <h1 style={{ fontSize: "1.8rem", marginBottom: "1rem", color: "var(--text)" }}>{t("order.orderSuccess")}</h1>
          <p style={{ marginBottom: "2rem", color: "var(--muted)" }}>{t("order.thankYou")}</p>

          <div style={{ textAlign: "left", marginBottom: "1.5rem", padding: "1rem", background: "var(--bg)", borderRadius: "8px" }}>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem", color: "var(--text)" }}>{t("order.details")}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>{t("order.product")}</span>
                <span style={{ color: "var(--text)" }}>{orderedProduct.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>{t("order.quantity")}</span>
                <span style={{ color: "var(--text)" }}>{formData.quantity}</span>
              </div>
              {formData.color && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>{t("order.color")}</span>
                  <span style={{ color: "var(--text)" }}>{formData.color}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>{t("order.name")}</span>
                <span style={{ color: "var(--text)" }}>{formData.fullName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>{t("order.phone")}</span>
                <span style={{ color: "var(--text)" }}>{formData.phoneNumber}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>{t("order.delivery")}</span>
                <span style={{ color: "var(--text)" }}>{formData.deliveryType === "home" ? t("order.home") : t("order.stopDesk")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.5rem", borderTop: "1px solid var(--line)" }}>
                <span style={{ color: "var(--muted)" }}>{t("order.productTotal")}</span>
                <span style={{ color: "var(--text)" }}>{productTotal.toLocaleString()} {orderedProduct.currency || "DA"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>{t("order.shipping")}</span>
                <span style={{ color: "var(--text)" }}>{shippingCost.toLocaleString()} {orderedProduct.currency || "DA"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.5rem", borderTop: "1px solid var(--line)", fontWeight: "bold" }}>
                <span style={{ color: "var(--text)" }}>{t("order.total")}</span>
                <span style={{ color: "var(--text)" }}>{orderTotal.toLocaleString()} {orderedProduct.currency || "DA"}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "0.75rem 1.5rem",
              background: "var(--accent)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            {t("order.continueShopping")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.imageSection}>
        <Image width={800} height={500} src={selectedImage} alt={product.name} className={styles.mainImage} />
        {images.length > 1 && (
          <div className={styles.thumbnails}>
            {images.map((img: string, idx: number) => (
              <Image
                key={img}
                src={resolveImageSrc(img)}
                width={80}
                height={80}
                alt={`${product.name} ${idx + 1}`}
                className={styles.thumbnail}
                onClick={() => setSelectedImage(resolveImageSrc(img))}
              />
            ))}
          </div>
        )}
      </div>

      <div className={styles.detailsSection}>
        <div>
          {p.brand && <p className={styles.brand}>{p.brand}</p>}
          <h1 className={styles.name}>{product.name}</h1>
          <p className={styles.price}>{product.price?.toFixed ? product.price.toFixed(2) : product.price} {product.currency || "DA"}</p>
        </div>

        <p className={styles.description}>
          {p.description || product.spec || t("product.defaultDesc")}
        </p>

        {soldOut && (p.movement || p.caseSize || p.waterResistance) && (
          <div className={styles.specs}>
            {p.movement && (
              <div className={styles.specItem}>
                <span className={styles.specLabel}>{t("product.movement")}</span>
                <span>{p.movement}</span>
              </div>
            )}
            {p.caseSize && (
              <div className={styles.specItem}>
                <span className={styles.specLabel}>{t("product.caseSize")}</span>
                <span>{p.caseSize}</span>
              </div>
            )}
            {p.waterResistance && (
              <div className={styles.specItem}>
                <span className={styles.specLabel}>{t("product.waterResistance")}</span>
                <span>{p.waterResistance}</span>
              </div>
            )}
          </div>
        )}

        {soldOut ? (
          <div className={styles.soldOutBox}>
            <span className={styles.soldOutBadge}>{t("productCard.soldOut")}</span>
            <p className={styles.soldOutNote}>{t("product.soldOutNote")}</p>
          </div>
        ) : (
          <OrderForm
            delivery={delivery}
            onOrderSubmit={handleOrderSubmit}
            onAddToCart={handleAddToCart}
            onInitiateCheckout={() =>
              trackInitiateCheckout(
                [{ id: product.id, quantity: 1 }],
                product.price,
              )
            }
            showAddToCart={true}
            productPrice={product.price}
            currency={product.currency || "DA"}
            colors={p.colors || null}
            quantity={true}
            specs={productSpecs}
          />
        )}
      </div>
    </div>
  );
}

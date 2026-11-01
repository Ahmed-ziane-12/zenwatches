"use client";

import { useState } from "react";
import { Product } from "@/lib/products";
import { useCart } from "@/components/CartProvider";
import OrderForm, { OrderFormData } from "@/components/OrderForm/OrderForm";
import styles from "./ProductDetail.module.css";
import Image from "next/image";
import { useLanguage } from "../LanguageProvider";

type ProductDetailProps = {
  product: Product;
};

export default function ProductDetail({ product }: ProductDetailProps) {
  const { add } = useCart();
  const { t } = useLanguage();
  const p: any = product as any;
  const fallbackImage = "/images/product.jpg";
  const initialImage = p.imageUrl || p.image || (Array.isArray(p.images) ? p.images[0] : null) || fallbackImage;
  const [selectedImage, setSelectedImage] = useState(initialImage);
  const images = Array.isArray(p.images) && p.images.length > 0 ? p.images : [selectedImage];
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const handleOrderSubmit = async (data: OrderFormData) => {
    try {
      const productTotal = (product.price || 0) * (data.quantity || 1);
      const shippingCost = data.deliveryType === "home" ? 600 : 400;

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
      setOrderDetails({
        order: result.order,
        formData: data,
        product,
        productTotal,
        shippingCost,
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
console.log(selectedImage);

  if (orderSuccess && orderDetails) {
    const { formData, product: orderedProduct, productTotal, shippingCost } = orderDetails;
    return (
      <div className={styles.container} style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ padding: "2rem", background: "var(--card)", borderRadius: "12px", border: "1px solid var(--line)" }}>
          <h1 style={{ fontSize: "1.8rem", marginBottom: "1rem", color: "var(--text)" }}>{t("order.orderSuccess")}</h1>
          <p style={{ marginBottom: "2rem", color: "var(--muted)" }}>Thank you for your order!</p>

          <div style={{ textAlign: "left", marginBottom: "1.5rem", padding: "1rem", background: "var(--bg)", borderRadius: "8px" }}>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem", color: "var(--text)" }}>Order Details</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Product</span>
                <span style={{ color: "var(--text)" }}>{orderedProduct.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Quantity</span>
                <span style={{ color: "var(--text)" }}>{formData.quantity}</span>
              </div>
              {formData.color && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Color</span>
                  <span style={{ color: "var(--text)" }}>{formData.color}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Name</span>
                <span style={{ color: "var(--text)" }}>{formData.fullName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Phone</span>
                <span style={{ color: "var(--text)" }}>{formData.phoneNumber}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Delivery</span>
                <span style={{ color: "var(--text)" }}>{formData.deliveryType === "home" ? t("order.home") : t("order.stopDesk")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.5rem", borderTop: "1px solid var(--line)" }}>
                <span style={{ color: "var(--muted)" }}>Product Total</span>
                <span style={{ color: "var(--text)" }}>{productTotal.toLocaleString()} {orderedProduct.currency || "DA"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Shipping</span>
                <span style={{ color: "var(--text)" }}>{shippingCost.toLocaleString()} {orderedProduct.currency || "DA"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.5rem", borderTop: "1px solid var(--line)", fontWeight: "bold" }}>
                <span style={{ color: "var(--text)" }}>Total</span>
                <span style={{ color: "var(--text)" }}>{formData.totalPrice.toLocaleString()} {orderedProduct.currency || "DA"}</span>
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
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.imageSection}>
        <Image width={800} height={500} src={`${selectedImage}`} alt={product.name} className={styles.mainImage} />
        {images.length > 1 && (
          <div className={styles.thumbnails}>
            {images.map((img: string, idx: number) => (
              <Image
                key={idx}
                src={`/${img}`}
                width={80}
                height={80}
                alt={`${product.name} ${idx + 1}`}
                className={styles.thumbnail}
                onClick={() => setSelectedImage(`/${img}`)}
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

        {(p.movement || p.caseSize || p.waterResistance) && (
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

        <OrderForm
          onOrderSubmit={handleOrderSubmit}
          onAddToCart={handleAddToCart}
          showAddToCart={true}
          productPrice={product.price}
          currency={product.currency || "DA"}
          colors={p.colors || null}
          quantity={true}
        />
      </div>
    </div>
  );
}

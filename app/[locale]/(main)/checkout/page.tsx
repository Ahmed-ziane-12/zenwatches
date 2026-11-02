"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import OrderForm, { OrderFormData } from "@/components/OrderForm/OrderForm";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./checkout.module.css";
import productStyles from "@/components/ProductDetail/ProductDetail.module.css";
import ProductImage from "@/components/ProductImage/ProductImage";
import { formatPrice } from "@/lib/products";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";

export default function CheckoutPage() {
  const { items, subtotal, clear, setQty } = useCart() as any;
  const { t } = useLanguage();
  const router = useRouter();
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const handleOrderSubmit = async (data: OrderFormData) => {
    try {
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
          items: items.map((item: any) => ({
            id: item.id,
            quantity: item.qty || 1,
            color: item.colorLabel || item.color || data.color,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit order");
      }

      const result = await response.json();
      setOrderDetails({
        order: result.order,
        formData: data,
        items,
        subtotal,
        shippingCost,
      });
      setOrderSuccess(true);
      if (typeof clear === "function") {
        clear();
      }
    } catch (error) {
      console.error("Order submission error:", error);
      alert(t("order.orderSuccess"));
    }
  };

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className={productStyles.container} style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center", paddingTop: "4rem" }}>
        <div style={{ padding: "2rem", background: "var(--card)", borderRadius: "12px", border: "1px solid var(--line)" }}>
          <h1 style={{ fontSize: "1.8rem", marginBottom: "1rem", color: "var(--text)" }}>{t("cart.empty")}</h1>
          <button
            onClick={() => router.back()}
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
            {t("hero.explore")}
          </button>
        </div>
      </div>
    );
  }

  if (orderSuccess && orderDetails) {
    const { formData, items: orderedItems, subtotal: orderSubtotal, shippingCost } = orderDetails;
    return (
      <div className={styles.wrapper}>
        <div className={styles.successCard}>
          <h1 className={styles.successTitle}>{t("order.orderSuccess")}</h1>
          <p className={styles.successSubtitle}>{t("order.thankYou")}</p>

          <div className={styles.orderSection}>
            <h2 className={styles.sectionTitle}>{t("order.details")}</h2>
            <div className={styles.itemsList}>
              {orderedItems.map((item: any, idx: number) => (
                <div key={idx} className={styles.itemRow}>
                  <div className={styles.itemThumb}>
                    <ProductImage product={item} labelled={false} sizes="60px" />
                  </div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemMeta}>
                      {t("order.qtyShort")}: {item.qty} {item.colorLabel && `• ${item.colorLabel}`}
                    </div>
                  </div>
                  <div className={styles.itemPrice}>{formatPrice(item.price * item.qty, item.currency)}</div>
                </div>
              ))}
            </div>
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>{t("order.name")}</span>
                <span className={styles.infoValue}>{formData.fullName}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>{t("order.phone")}</span>
                <span className={styles.infoValue}>{formData.phoneNumber}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>{t("order.delivery")}</span>
                <span className={styles.infoValue}>{formData.deliveryType === "home" ? t("order.home") : t("order.stopDesk")}</span>
              </div>
              <div className={styles.divider} />
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>{t("cart.total")}</span>
                <span className={styles.infoValue}>{formatPrice(orderSubtotal, orderedItems[0]?.currency)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>{t("order.shipping")}</span>
                <span className={styles.infoValue}>{shippingCost.toLocaleString()} {orderedItems[0]?.currency || "DA"}</span>
              </div>
              <div className={styles.divider} />
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>{t("order.totalPrice")}</span>
                <span className={styles.totalValue}>{(orderSubtotal + shippingCost).toLocaleString()} {orderedItems[0]?.currency || "DA"}</span>
              </div>
            </div>
          </div>

          <button className={styles.continueBtn} onClick={() => router.push("/")}>
            {t("hero.explore")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.pageTitle}>{t("cart.checkout")}</h1>
      <div className={styles.grid}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t("cart.title")}</h2>
          <div className={styles.cartCard}>
            {items.map((item: any) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.cartThumb}>
                  <ProductImage product={item} labelled={false} sizes="80px" />
                </div>
                <div className={styles.cartInfo}>
                  <div className={styles.cartName}>{item.name}</div>
                  {item.colorLabel && <div className={styles.cartMeta}>{item.colorLabel}</div>}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={() => setQty && setQty(item.id, Math.max(1, (item.qty || 1) - 1))}
                      style={{ padding: "0.3rem", border: "1px solid var(--line)", borderRadius: "6px", background: "transparent", cursor: "pointer" }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ minWidth: "30px", textAlign: "center", color: "var(--text)", fontSize: "0.9rem" }}>{item.qty || 1}</span>
                    <button
                      type="button"
                      onClick={() => setQty && setQty(item.id, (item.qty || 1) + 1)}
                      style={{ padding: "0.3rem", border: "1px solid var(--line)", borderRadius: "6px", background: "transparent", cursor: "pointer" }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div className={styles.cartPrice}>{formatPrice(item.price * (item.qty || 1), item.currency)}</div>
              </div>
            ))}
            <div className={styles.cartTotal}>
              <span className={styles.cartTotalLabel}>{t("cart.total")}</span>
              <strong className={styles.cartTotalValue}>{formatPrice(subtotal, items[0]?.currency)}</strong>
            </div>
          </div>
        </div>
        <div className={styles.section}>
          <OrderForm onOrderSubmit={handleOrderSubmit} showAddToCart={false} productPrice={subtotal} quantity={false} />
        </div>
      </div>
    </div>
  );
}

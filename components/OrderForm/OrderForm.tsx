"use client";

import { useState, useEffect, useMemo } from "react";
import dz from "geoalgeria";
import { Minus, Plus } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./OrderForm.module.css";

export type OrderFormData = {
  fullName: string;
  phoneNumber: string;
  wilaya: string;
  commune: string;
  deliveryType: "home" | "stop-desk";
  quantity: number;
  color?: string;
  totalPrice: number;
};

type OrderFormProps = {
  onOrderSubmit?: (data: OrderFormData) => void;
  onAddToCart?: () => void;
  showAddToCart?: boolean;
  productPrice?: number;
  currency?: string;
  colors?: string[] | null;
  quantity?: boolean;
};

const STOP_DESK_FEE = 400;
const HOME_DELIVERY_FEE = 600;

export default function OrderForm({
  onOrderSubmit,
  onAddToCart,
  showAddToCart = true,
  productPrice = 0,
  currency = "DA",
  colors,
  quantity = true
}: OrderFormProps) {
  const { t } = useLanguage();
  const wilayas = dz.wilayas;
  const [formData, setFormData] = useState<OrderFormData>({
    fullName: "",
    phoneNumber: "",
    wilaya: "",
    commune: "",
    deliveryType: "stop-desk",
    quantity: 1,
    color: colors && colors.length > 0 ? colors[0] : undefined,
    totalPrice: productPrice + STOP_DESK_FEE,
  });
  const [communes, setCommunes] = useState<any[]>([]);

  useEffect(() => {
    if (formData.wilaya) {
      const wilayaId = parseInt(formData.wilaya);
      const communesList = dz.getCommunesByWilaya(wilayaId);
      setCommunes(communesList);
      setFormData((prev) => ({ ...prev, commune: "" }));
    } else {
      setCommunes([]);
    }
  }, [formData.wilaya]);

  const shippingCost = useMemo(() => {
    return formData.deliveryType === "home" ? HOME_DELIVERY_FEE : STOP_DESK_FEE;
  }, [formData.deliveryType]);

  useEffect(() => {
    const itemsTotal = quantity ? productPrice * Math.max(1, formData.quantity || 1) : productPrice;
    const total = itemsTotal + shippingCost;
    setFormData((prev) => ({ ...prev, totalPrice: total }));
  }, [productPrice, formData.quantity, shippingCost, quantity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onOrderSubmit) {
      onOrderSubmit(formData);
    }
  };

  const decreaseQty = () => {
    setFormData((prev) => ({ ...prev, quantity: Math.max(1, (prev.quantity || 1) - 1) }));
  };

  const increaseQty = () => {
    setFormData((prev) => ({ ...prev, quantity: (prev.quantity || 1) + 1 }));
  };

  
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3 className={styles.title}>{t("order.title")}</h3>
      
      <div className={styles.field}>
        <label htmlFor="fullName" className={styles.label}>{t("order.fullName")}</label>
        <input
          id="fullName"
          type="text"
          className={styles.input}
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="phoneNumber" className={styles.label}>{t("order.phoneNumber")}</label>
        <input
          id="phoneNumber"
          type="tel"
          className={styles.input}
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          required
        />
      </div>

      {colors && colors.length > 0 && (
        <div className={styles.field}>
          <label htmlFor="color" className={styles.label}>{t("order.color")}</label>
          <select
            id="color"
            className={styles.select}
            value={formData.color || ""}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            required
          >
            {colors.map((color, idx) => (
              <option key={idx} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>
      )}

      {quantity && (<div className={styles.field}>
        <label className={styles.label}>{t("order.quantity")}</label>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button type="button" onClick={decreaseQty} style={{ padding: "0.5rem", border: "1px solid var(--line)", borderRadius: "8px", background: "transparent", cursor: "pointer" }}>
            <Minus size={16} />
          </button>
          <input
            type="text"
            readOnly
            className={styles.input}
            value={formData.quantity}
            style={{ textAlign: "center", width: "60px" }}
          />
          <button type="button" onClick={increaseQty} style={{ padding: "0.5rem", border: "1px solid var(--line)", borderRadius: "8px", background: "transparent", cursor: "pointer" }}>
            <Plus size={16} />
          </button>
        </div>
      </div>)}

      <div className={styles.field}>
        <label htmlFor="wilaya" className={styles.label}>{t("order.wilaya")}</label>
        <select
          id="wilaya"
          className={styles.select}
          value={formData.wilaya}
          onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
          required
        >
          <option value="">{t("order.selectWilaya")}</option>
          {wilayas.map((wilaya: any) => (
            <option key={wilaya.code} value={wilaya.code}>
              {wilaya.code} {wilaya.name_fr}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="commune" className={styles.label}>{t("order.commune")}</label>
        <select
          id="commune"
          className={styles.select}
          value={formData.commune}
          onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
          required
          disabled={!formData.wilaya}
        >
          <option value="">{t("order.selectCommune")}</option>
          {communes.map((commune: any) => (
            <option key={commune.code_commune} value={commune.code_commune}>
              {commune.name_fr}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t("order.deliveryType")}</label>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="deliveryType"
              value="stop-desk"
              checked={formData.deliveryType === "stop-desk"}
              onChange={(e) => setFormData({ ...formData, deliveryType: e.target.value as "home" | "stop-desk" })}
            />
            {t("order.stopDesk")} ({STOP_DESK_FEE} {currency})
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="deliveryType"
              value="home"
              checked={formData.deliveryType === "home"}
              onChange={(e) => setFormData({ ...formData, deliveryType: e.target.value as "home" | "stop-desk" })}
            />
            {t("order.home")} ({HOME_DELIVERY_FEE} {currency})
          </label>
        </div>
      </div>

      <div className={styles.field}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderTop: "1px solid var(--line)" }}>
          <span>{t("order.totalPrice")}</span>
          <strong>{formData.totalPrice.toLocaleString()} {currency}</strong>
        </div>
        <div style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
          {t("order.product")}: {(quantity ? productPrice * Math.max(1, formData.quantity || 1) : productPrice).toLocaleString()} {currency} + {t("order.shipping")}: {shippingCost} {currency}
        </div>
      </div>

      <button type="submit" className={styles.submitBtn}>
        {t("order.orderNow")}
      </button>

      {showAddToCart && (
        <button type="button" className={styles.cartBtn} onClick={onAddToCart}>
          {t("order.addToCart")}
        </button>
      )}
    </form>
  );
}

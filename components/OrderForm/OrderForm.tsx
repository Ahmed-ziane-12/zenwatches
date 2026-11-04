"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Check,
  ChevronDown,
  ClipboardList,
  MapPin,
  Minus,
  Phone,
  Plus,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  User,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { shippingPrices, officeLocations } from "@/lib/delivery";
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
  /** Fired once, the first time the visitor interacts with the form. */
  onInitiateCheckout?: () => void;
  showAddToCart?: boolean;
  productPrice?: number;
  currency?: string;
  colors?: string[] | null;
  quantity?: boolean;
};

function RequiredMark() {
  return (
    <span className={styles.requiredMark} aria-hidden="true">
      *
    </span>
  );
}

export default function OrderForm({
  onOrderSubmit,
  onAddToCart,
  onInitiateCheckout,
  showAddToCart = true,
  productPrice = 0,
  currency = "DA",
  colors,
  quantity = true,
}: OrderFormProps) {
  const { t } = useLanguage();
  const wilayas = useMemo(() => Object.keys(shippingPrices), []);
  const checkoutStarted = useRef(false);
  const [formData, setFormData] = useState<OrderFormData>({
    fullName: "",
    phoneNumber: "",
    wilaya: "",
    commune: "",
    deliveryType: "stop-desk",
    quantity: 1,
    color: colors && colors.length > 0 ? colors[0] : undefined,
    totalPrice: productPrice,
  });

  const selectedPrices = formData.wilaya ? shippingPrices[formData.wilaya] : undefined;
  const stopDeskLocations = formData.wilaya ? officeLocations[formData.wilaya] ?? [] : [];
  const stopDeskAvailable = !formData.wilaya || stopDeskLocations.length > 0;
  const hasItemOptions = Boolean(colors && colors.length > 0) || quantity;

  const shippingCost = useMemo(() => {
    const prices = formData.wilaya ? shippingPrices[formData.wilaya] : undefined;
    if (!prices) return 0;
    return formData.deliveryType === "home" ? prices.home : prices.desk;
  }, [formData.deliveryType, formData.wilaya]);

  const itemsTotal = useMemo(
    () => (quantity ? productPrice * Math.max(1, formData.quantity || 1) : productPrice),
    [productPrice, formData.quantity, quantity],
  );

  useEffect(() => {
    const total = itemsTotal + shippingCost;
    setFormData((prev) => (prev.totalPrice === total ? prev : { ...prev, totalPrice: total }));
  }, [itemsTotal, shippingCost]);

  const formatMoney = (value: number, showFree = false) => {
    if (showFree && value === 0) return t("order.free");
    return `${Number(value || 0).toLocaleString()} ${currency}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onOrderSubmit) {
      onOrderSubmit(formData);
    }
  };

  const handleFirstInteraction = () => {
    if (checkoutStarted.current) return;
    checkoutStarted.current = true;
    onInitiateCheckout?.();
  };

  const decreaseQty = () => {
    setFormData((prev) => ({ ...prev, quantity: Math.max(1, (prev.quantity || 1) - 1) }));
  };

  const increaseQty = () => {
    setFormData((prev) => ({ ...prev, quantity: (prev.quantity || 1) + 1 }));
  };

  const handleWilayaChange = (wilaya: string) => {
    setFormData((prev) => {
      const offices = officeLocations[wilaya] ?? [];
      const deliveryType =
        prev.deliveryType === "stop-desk" && offices.length === 0 ? "home" : prev.deliveryType;
      return { ...prev, wilaya, commune: "", deliveryType };
    });
  };

  const handleDeliveryTypeChange = (deliveryType: "home" | "stop-desk") => {
    setFormData((prev) => ({ ...prev, deliveryType, commune: "" }));
  };

  return (
    <form onSubmit={handleSubmit} onFocusCapture={handleFirstInteraction} className={styles.form}>
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <span className={styles.headerIcon}>
            <ClipboardList size={20} />
          </span>
          <div>
            <h3 className={styles.title}>{t("order.title")}</h3>
            <p className={styles.requiredHint}>{t("order.requiredFields")}</p>
          </div>
        </div>
        <span className={styles.codBadge}>
          <ShieldCheck size={13} />
          {t("order.payOnDelivery")}
        </span>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.step}>1</span>
          <h4 className={styles.sectionTitle}>{t("order.contactDetails")}</h4>
        </div>
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label htmlFor="fullName" className={styles.label}>
              {t("order.fullName")}
              <RequiredMark />
            </label>
            <div className={styles.inputWrap}>
              <User size={16} className={styles.fieldIcon} aria-hidden="true" />
              <input
                id="fullName"
                type="text"
                className={`${styles.input} ${styles.withIcon}`}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                autoComplete="name"
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="phoneNumber" className={styles.label}>
              {t("order.phoneNumber")}
              <RequiredMark />
            </label>
            <div className={styles.inputWrap}>
              <Phone size={16} className={styles.fieldIcon} aria-hidden="true" />
              <input
                id="phoneNumber"
                type="tel"
                inputMode="tel"
                dir="ltr"
                className={`${styles.input} ${styles.withIcon} ${styles.ltrInput}`}
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                autoComplete="tel"
                required
              />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.step}>2</span>
          <h4 className={styles.sectionTitle}>{t("order.deliveryDetails")}</h4>
        </div>

        <div className={styles.field}>
          <label htmlFor="wilaya" className={styles.label}>
            {t("order.wilaya")}
            <RequiredMark />
          </label>
          <div className={styles.selectWrap}>
            <MapPin size={16} className={styles.fieldIcon} aria-hidden="true" />
            <select
              id="wilaya"
              className={`${styles.select} ${styles.withIcon}`}
              value={formData.wilaya}
              onChange={(e) => handleWilayaChange(e.target.value)}
              autoComplete="address-level1"
              required
            >
              <option value="">{t("order.selectWilaya")}</option>
              {wilayas.map((wilaya) => (
                <option key={wilaya} value={wilaya}>
                  {wilaya}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className={styles.selectChevron} aria-hidden="true" />
          </div>
        </div>

        <fieldset className={styles.deliveryFieldset}>
          <legend className={styles.label}>
            {t("order.deliveryType")}
            <RequiredMark />
          </legend>
          <div className={styles.deliveryCards}>
            <label
              className={`${styles.deliveryCard} ${
                formData.deliveryType === "stop-desk" ? styles.deliveryCardActive : ""
              } ${!stopDeskAvailable ? styles.deliveryCardDisabled : ""}`}
            >
              <input
                type="radio"
                name="deliveryType"
                value="stop-desk"
                className={styles.deliveryRadio}
                checked={formData.deliveryType === "stop-desk"}
                onChange={() => handleDeliveryTypeChange("stop-desk")}
                disabled={!stopDeskAvailable}
                required
              />
              <span className={styles.deliveryTop}>
                <span className={styles.deliveryIcon}>
                  <Store size={18} />
                </span>
                <span className={styles.deliveryCheck}>
                  <Check size={12} />
                </span>
              </span>
              <span className={styles.deliveryBody}>
                <strong>{t("order.stopDesk")}</strong>
                <small>{t("order.stopDeskHint")}</small>
              </span>
              <span
                className={`${styles.deliveryPrice} ${
                  selectedPrices && stopDeskAvailable ? "" : styles.deliveryPriceMuted
                }`}
              >
                {selectedPrices && stopDeskAvailable ? formatMoney(selectedPrices.desk, true) : "—"}
              </span>
            </label>

            <label
              className={`${styles.deliveryCard} ${
                formData.deliveryType === "home" ? styles.deliveryCardActive : ""
              }`}
            >
              <input
                type="radio"
                name="deliveryType"
                value="home"
                className={styles.deliveryRadio}
                checked={formData.deliveryType === "home"}
                onChange={() => handleDeliveryTypeChange("home")}
              />
              <span className={styles.deliveryTop}>
                <span className={styles.deliveryIcon}>
                  <Truck size={18} />
                </span>
                <span className={styles.deliveryCheck}>
                  <Check size={12} />
                </span>
              </span>
              <span className={styles.deliveryBody}>
                <strong>{t("order.home")}</strong>
                <small>{t("order.homeHint")}</small>
              </span>
              <span
                className={`${styles.deliveryPrice} ${
                  selectedPrices ? "" : styles.deliveryPriceMuted
                }`}
              >
                {selectedPrices ? formatMoney(selectedPrices.home, true) : "—"}
              </span>
            </label>
          </div>
          {!stopDeskAvailable && (
            <p className={styles.hint}>{t("order.stopDeskUnavailable")}</p>
          )}
        </fieldset>

        <div className={styles.field}>
          <label htmlFor="commune" className={styles.label}>
            {t("order.commune")}
            <RequiredMark />
          </label>
          {formData.deliveryType === "stop-desk" ? (
            <div className={styles.selectWrap}>
              <MapPin size={16} className={styles.fieldIcon} aria-hidden="true" />
              <select
                id="commune"
                className={`${styles.select} ${styles.withIcon}`}
                value={formData.commune}
                onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                autoComplete="address-level2"
                required
                disabled={!formData.wilaya}
              >
                <option value="">{t("order.selectCommune")}</option>
                {stopDeskLocations.map((commune) => (
                  <option key={commune} value={commune}>
                    {commune}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} className={styles.selectChevron} aria-hidden="true" />
            </div>
          ) : (
            <div className={styles.inputWrap}>
              <MapPin size={16} className={styles.fieldIcon} aria-hidden="true" />
              <input
                id="commune"
                type="text"
                className={`${styles.input} ${styles.withIcon}`}
                value={formData.commune}
                onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                placeholder={t("order.communePlaceholder")}
                autoComplete="address-level2"
                required
              />
            </div>
          )}
        </div>
      </section>

      {hasItemOptions && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.step}>3</span>
            <h4 className={styles.sectionTitle}>{t("order.itemDetails")}</h4>
          </div>
          <div className={styles.fieldGrid}>
            {colors && colors.length > 0 && (
              <div className={styles.field}>
                <label htmlFor="color" className={styles.label}>
                  {t("order.color")}
                  <RequiredMark />
                </label>
                <div className={styles.selectWrap}>
                  <select
                    id="color"
                    className={`${styles.select} ${styles.selectNoIcon}`}
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
                  <ChevronDown size={15} className={styles.selectChevron} aria-hidden="true" />
                </div>
              </div>
            )}

            {quantity && (
              <div className={styles.field}>
                <span className={styles.label}>{t("order.quantity")}</span>
                <div className={styles.quantityControl}>
                  <button
                    type="button"
                    className={styles.qtyBtn}
                    onClick={decreaseQty}
                    disabled={formData.quantity <= 1}
                    aria-label={`${t("order.quantity")} -`}
                  >
                    <Minus size={15} />
                  </button>
                  <input
                    type="text"
                    readOnly
                    className={styles.qtyInput}
                    value={formData.quantity}
                    aria-label={t("order.quantity")}
                  />
                  <button
                    type="button"
                    className={styles.qtyBtn}
                    onClick={increaseQty}
                    aria-label={`${t("order.quantity")} +`}
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <div className={styles.summary}>
        <div className={styles.summaryHeader}>
          <ReceiptText size={15} />
          <span>{t("order.summary")}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>{t("order.product")}</span>
          <span>{formatMoney(itemsTotal)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>{t("order.shipping")}</span>
          <span>{formData.wilaya ? formatMoney(shippingCost, true) : "—"}</span>
        </div>
        <div className={styles.summaryTotal}>
          <span>{t("order.totalPrice")}</span>
          <strong>{formatMoney(formData.totalPrice)}</strong>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.submitBtn}>
          <ShoppingBag size={17} />
          {t("order.orderNow")}
        </button>

        {showAddToCart && (
          <button type="button" className={styles.cartBtn} onClick={onAddToCart}>
            <ShoppingCart size={16} />
            {t("order.addToCart")}
          </button>
        )}
      </div>
    </form>
  );
}

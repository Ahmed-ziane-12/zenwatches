"use client";

import { useEffect, useRef } from "react";
import { useCart } from "../CartProvider";
import { useLanguage } from "../LanguageProvider";
import ProductImage from "../ProductImage/ProductImage";
import { formatPrice } from "@/lib/products";
import styles from "./CartDrawer.module.css";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

const FOCUSABLE = 'button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])';

export default function CartDrawer() {
  const { isOpen, close, items, count, subtotal, setQty, remove } = useCart();
  const { t } = useLanguage();
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "ar";

  const handleCheckout = () => {
    close();
    router.push(`/${locale}/checkout`);
  };

  // While open: lock page scroll, focus the panel, close on Escape, keep Tab inside the panel.
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const nodes = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div className={styles.root}>
      <div className={styles.overlay} onClick={close} aria-hidden="true" />
      <aside ref={panelRef} className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="bag-title">
        <header className={styles.head}>
          <h2 id="bag-title" className={styles.title}>
            {t("cart.title")} <span className={styles.count}>{count}</span>
          </h2>
          <button ref={closeRef} type="button" className={styles.close} onClick={close} aria-label={t("aria.closeMenu")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </header>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>{t("cart.empty")}</p>
            <p className={styles.emptyText}>{t("cart.emptyText")}</p>
            <button type="button" className={styles.secondary} onClick={close}>
              {t("cart.keepBrowsing")}
            </button>
          </div>
        ) : (
          <>
            <ul className={styles.list}>
              {items.map((it) => (
                <li key={it.id} className={styles.line}>
                  <div className={styles.thumb}>
                    <ProductImage product={it} labelled={false} className={styles.thumbArt} sizes="76px" />
                  </div>
                  <div className={styles.info}>
                    <p className={styles.name}>{it.name}</p>
                    {it.colorLabel && <p className={styles.meta}>{it.colorLabel}</p>}
                    {it.spec && <p className={styles.meta}>{it.spec}</p>}
                    <div className={styles.row}>
                      <div className={styles.stepper} role="group" aria-label={t("cart.quantityOf", { name: it.name })}>
                        <button type="button" onClick={() => setQty(it.id, it.qty - 1)} aria-label={t("cart.removeOne", { name: it.name })}>
                          −
                        </button>
                        <span aria-live="polite">{it.qty}</span>
                        <button type="button" onClick={() => setQty(it.id, it.qty + 1)} aria-label={t("cart.addOne", { name: it.name })}>
                          +
                        </button>
                      </div>
                      <button type="button" className={styles.remove} onClick={() => remove(it.id)}>
                        {t("cart.remove")}
                      </button>
                    </div>
                  </div>
                  <p className={styles.price}>{formatPrice(it.price * it.qty, it.currency)}</p>
                </li>
              ))}
            </ul>

            <footer className={styles.foot}>
              <div className={styles.subtotal}>
                <span>{t("cart.total")}</span>
                <strong>{formatPrice(subtotal, items[0]?.currency)}</strong>
              </div>
              <p className={styles.fine}>{t("cart.shippingNote")}</p>
              {/* TODO: connect to your checkout (Stripe, Shopify, etc.). */}
              <button type="button" className={styles.checkout} onClick={handleCheckout}>
                {t("cart.checkout")}
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

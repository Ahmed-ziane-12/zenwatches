"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Cookie } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  getMetaConsent,
  metaConsentRequired,
  setMetaConsent,
} from "@/lib/meta-consent";
import styles from "./CookieConsent.module.css";

export default function CookieConsent() {
  const { t } = useLanguage();
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!metaConsentRequired()) return;
    setVisible(getMetaConsent() === null);
  }, []);

  if (!visible) return null;

  const choose = (value: "granted" | "denied") => {
    setMetaConsent(value);
    setVisible(false);
  };

  return (
    <div className={styles.wrap} role="dialog" aria-live="polite" aria-label={t("consent.message")}>
      <div className={styles.card}>
        <span className={styles.icon}>
          <Cookie size={20} />
        </span>
        <div className={styles.body}>
          <p className={styles.text}>{t("consent.message")}</p>
          <Link href={`/${locale}/privacy`} className={styles.link}>
            {t("consent.privacy")}
          </Link>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.decline}
            onClick={() => choose("denied")}
          >
            {t("consent.decline")}
          </button>
          <button
            type="button"
            className={styles.accept}
            onClick={() => choose("granted")}
          >
            {t("consent.accept")}
          </button>
        </div>
      </div>
    </div>
  );
}

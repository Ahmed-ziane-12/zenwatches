"use client";

import type { CSSProperties } from "react";
import styles from "./LoyaltyCard.module.css";
import { useLanguage } from "@/components/LanguageProvider";

type LoyaltyCardProps = {
  /** Purchases completed in the current cycle (0 to 4). */
  purchases: number;
  /** Number of purchase steps before the gift. Defaults to 4. */
  totalPurchases?: number;
  title?: string;
  giftLabel?: string;
};

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" />
    </svg>
  );
}

export default function LoyaltyCard({
  purchases,
  totalPurchases = 4,
  title,
  giftLabel,
}: LoyaltyCardProps) {
  const { t } = useLanguage();
  const cardTitle = title || t("loyalty.title");
  const giftText = giftLabel || t("loyalty.freeGift");
  const completed = Math.max(0, Math.min(purchases, totalPurchases));
  const giftUnlocked = completed >= totalPurchases;
  const remaining = totalPurchases - completed;
  const progress = (completed / totalPurchases) * 100;

  const subtitle = giftUnlocked
    ? t("loyalty.giftReady")
    : t("loyalty.morePurchases", { count: remaining });

  return (
    <section
      className={`${styles.card} ${giftUnlocked ? styles.unlocked : ""}`}
      aria-label={cardTitle}
    >
      <header className={styles.header}>
        <div>
          <h3 className={styles.title}>{cardTitle}</h3>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <span className={styles.badge}>
          {completed}/{totalPurchases}
        </span>
      </header>

      <div
        className={styles.steps}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={totalPurchases}
        aria-valuenow={completed}
        aria-valuetext={subtitle}
      >
        <div className={styles.track} aria-hidden="true">
          <div className={styles.fill} style={{ width: `${progress}%` }} />
        </div>

        {Array.from({ length: totalPurchases }, (_, i) => {
          const done = i < completed;
          const current = i === completed && !giftUnlocked;
          return (
            <div className={styles.step} key={i}>
              <div
                className={`${styles.circle} ${done ? styles.done : ""} ${current ? styles.current : ""}`}
                style={{ "--delay": `${i * 90}ms` } as CSSProperties}
              >
                {done ? <CheckIcon /> : <BagIcon />}
              </div>
              <span className={styles.label}>{t("loyalty.purchase", { n: i + 1 })}</span>
            </div>
          );
        })}

        <div className={styles.step}>
          <div
            className={`${styles.circle} ${styles.gift} ${giftUnlocked ? styles.giftUnlocked : ""}`}
          >
            <GiftIcon />
          </div>
          <span className={`${styles.label} ${giftUnlocked ? styles.labelActive : ""}`}>
            {giftText}
          </span>
        </div>
      </div>
    </section>
  );
}
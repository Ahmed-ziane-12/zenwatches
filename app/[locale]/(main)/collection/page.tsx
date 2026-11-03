"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PackageOpen } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./collection.module.css";

export default function CollectionPage() {
  const { t } = useLanguage();
  const params = useParams();
  const locale = (params?.locale as string) || "ar";

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{t("collection.title")}</h1>
      <p className={styles.subtitle}>{t("collection.subtitle")}</p>

      <div className={styles.empty}>
        <PackageOpen className={styles.icon} size={48} strokeWidth={1.5} aria-hidden="true" />
        <p className={styles.message}>{t("collection.empty")}</p>
        <p className={styles.hint}>{t("collection.hint")}</p>
        <Link href={`/${locale}/watches`} className={styles.button}>
          {t("collection.browse")}
        </Link>
      </div>
    </main>
  );
}

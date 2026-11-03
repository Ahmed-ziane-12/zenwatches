"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import type { BrandSummary } from "@/lib/watches";
import styles from "./TopBrands.module.css";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const TopBrands = ({ brands }: { brands: BrandSummary[] }) => {
  const { t } = useLanguage();
  const params = useParams();
  const locale = (params?.locale as string) || "ar";

  if (brands.length === 0) return null;

  return (
    <section className={styles.topBrands} aria-labelledby="top-brands-title">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{t("topBrands.eyebrow")}</p>
          <h2 id="top-brands-title" className={styles.title}>
            {t("topBrands.title")}
          </h2>
        </div>
        <Link href={`/${locale}/watches`} className={styles.exploreLink}>
          {t("categories.exploreAll")} <ArrowUpRight size={16} />
        </Link>
      </div>

      <ul className={styles.brandList}>
        {brands.map((brand, index) => (
          <li key={brand.name} className={styles.brandItem}>
            <Link
              href={`/${locale}/watches?brand=${encodeURIComponent(brand.name)}`}
              className={styles.brandLink}
            >
              <span className={styles.rank} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={styles.monogram} aria-hidden="true">
                {initials(brand.name)}
              </span>
              <span className={styles.brandText}>
                <span className={styles.brandName}>{brand.name}</span>
                <span className={styles.brandCount}>
                  {brand.count === 1
                    ? t("watches.countOne")
                    : t("watches.count", { count: brand.count })}
                </span>
              </span>
              <ArrowUpRight className={styles.arrow} size={16} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TopBrands;

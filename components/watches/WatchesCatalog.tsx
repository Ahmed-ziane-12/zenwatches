// components/watches/WatchesCatalog.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/lib/products"; // adjust path
import  ProductCard  from "@/components/ProductCard/ProductCard"; 
import { useLanguage } from "@/components/LanguageProvider";
import {
  CATEGORIES,
  applyFilters,
  getPriceBounds,
  getUniqueBrands,
  hasActiveFilters,
  parseFilters,
  toSearchParams,
  type WatchFilters,
} from "@/lib/watch-filters";
import styles from "./WatchesCatalog.module.css";

const CATEGORY_KEYS: Record<string, string> = {
  men: "watches.category.men",
  women: "watches.category.women",
  luxury: "watches.category.luxury",
  unisex: "watches.category.unisex",
  accessories: "watches.category.accessories",
};

export function WatchesCatalog({ products }: { products: Product[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  // The URL is the single source of truth
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const brands = useMemo(() => getUniqueBrands(products), [products]);
  const bounds = useMemo(() => getPriceBounds(products), [products]);
  const results = useMemo(() => applyFilters(products, filters), [products, filters]);
  const currency = products[0]?.currency ?? "";

  const update = useCallback(
    (patch: Partial<WatchFilters>) => {
      const qs = toSearchParams({ ...filters, ...patch }).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [filters, pathname, router]
  );

  // Debounced search box (local state so typing stays smooth)
  const [search, setSearch] = useState(filters.q);
  useEffect(() => {
    if (search.trim() === filters.q) return;
    const timer = setTimeout(() => update({ q: search.trim() }), 300);
    return () => clearTimeout(timer);
  }, [search, filters.q, update]);

  const toggleBrand = (brand: string) => {
    const has = filters.brands.some((b) => b.toLowerCase() === brand.toLowerCase());
    update({
      brands: has
        ? filters.brands.filter((b) => b.toLowerCase() !== brand.toLowerCase())
        : [...filters.brands, brand],
    });
  };

  const clearAll = () => {
    setSearch("");
    router.replace(pathname, { scroll: false });
  };

  const setPrice = (key: "minPrice" | "maxPrice", raw: string) => {
    const n = raw === "" ? null : Number(raw);
    update({ [key]: n !== null && Number.isFinite(n) && n >= 0 ? n : null });
  };

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{t("watches.title")}</h1>

      <div className={styles.layout}>
        {/* Filters */}
        <aside className={styles.filters}>
          <div className={styles.group}>
            <label htmlFor="watch-search" className={styles.label}>
              {t("watches.search")}
            </label>
            <input
              id="watch-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("watches.searchPlaceholder")}
              className={styles.input}
            />
          </div>

          <fieldset className={styles.group}>
            <legend className={styles.label}>{t("watches.category")}</legend>
            <div className={styles.chips}>
              {CATEGORIES.map((c) => {
                const active = filters.category === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => update({ category: active ? null : c.value })}
                    className={`${styles.chip} ${active ? styles.chipActive : ""}`}
                  >
                    {t(CATEGORY_KEYS[c.value] as any)}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.label}>{t("watches.brand")}</legend>
            <div className={styles.checks}>
              {brands.map((brand) => (
                <label key={brand} className={styles.check}>
                  <input
                    type="checkbox"
                    checked={filters.brands.some((b) => b.toLowerCase() === brand.toLowerCase())}
                    onChange={() => toggleBrand(brand)}
                  />
                  {brand}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.label}>{t("watches.price")} {currency && `(${currency})`}</legend>
            <div className={styles.priceRow}>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                aria-label={t("watches.minPrice")}
                placeholder={bounds ? String(bounds.min) : t("watches.min")}
                value={filters.minPrice ?? ""}
                onChange={(e) => setPrice("minPrice", e.target.value)}
                className={styles.input}
              />
              <span aria-hidden="true">–</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                aria-label={t("watches.maxPrice")}
                placeholder={bounds ? String(bounds.max) : t("watches.max")}
                value={filters.maxPrice ?? ""}
                onChange={(e) => setPrice("maxPrice", e.target.value)}
                className={styles.input}
              />
            </div>
          </fieldset>

          {hasActiveFilters(filters) && (
            <button type="button" onClick={clearAll} className={styles.linkButton}>
              {t("watches.clearAll")}
            </button>
          )}
        </aside>

        {/* Results */}
        <section>
          <p className={styles.count} aria-live="polite">
            {results.length === 1 ? t("watches.countOne") : t("watches.count", { count: results.length })}
          </p>

          {results.length === 0 ? (
            <div className={styles.empty}>
              <p>{t("watches.empty")}</p>
              <button type="button" onClick={clearAll} className={styles.linkButton}>
                {t("watches.clearAll")}
              </button>
            </div>
          ) : (
            <ul className={styles.grid}>
              {results.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
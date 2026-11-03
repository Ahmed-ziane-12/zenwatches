// components/watches/WatchesCatalog.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/lib/products"; // adjust path
import  ProductCard  from "@/components/ProductCard/ProductCard"; 
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

export function WatchesCatalog({ products }: { products: Product[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
    const t = setTimeout(() => update({ q: search.trim() }), 300);
    return () => clearTimeout(t);
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
      <h1 className={styles.title}>Watches</h1>

      <div className={styles.layout}>
        {/* Filters */}
        <aside className={styles.filters}>
          <div className={styles.group}>
            <label htmlFor="watch-search" className={styles.label}>
              Search
            </label>
            <input
              id="watch-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search watches…"
              className={styles.input}
            />
          </div>

          <fieldset className={styles.group}>
            <legend className={styles.label}>Category</legend>
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
                    {c.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.label}>Brand</legend>
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
            <legend className={styles.label}>Price {currency && `(${currency})`}</legend>
            <div className={styles.priceRow}>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                aria-label="Minimum price"
                placeholder={bounds ? String(bounds.min) : "Min"}
                value={filters.minPrice ?? ""}
                onChange={(e) => setPrice("minPrice", e.target.value)}
                className={styles.input}
              />
              <span aria-hidden="true">–</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                aria-label="Maximum price"
                placeholder={bounds ? String(bounds.max) : "Max"}
                value={filters.maxPrice ?? ""}
                onChange={(e) => setPrice("maxPrice", e.target.value)}
                className={styles.input}
              />
            </div>
          </fieldset>

          {hasActiveFilters(filters) && (
            <button type="button" onClick={clearAll} className={styles.linkButton}>
              Clear all filters
            </button>
          )}
        </aside>

        {/* Results */}
        <section>
          <p className={styles.count} aria-live="polite">
            {results.length} {results.length === 1 ? "watch" : "watches"}
          </p>

          {results.length === 0 ? (
            <div className={styles.empty}>
              <p>No watches match your filters.</p>
              <button type="button" onClick={clearAll} className={styles.linkButton}>
                Clear all filters
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
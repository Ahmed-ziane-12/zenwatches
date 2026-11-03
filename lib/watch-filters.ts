
import type { Product } from "@/lib/products"; 

export const CATEGORIES = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "smart", label: "Smart" },
  { value: "accessories", label: "Accessories" },
] as const;

export interface WatchFilters {
  q: string;
  brands: string[];
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
}

type ParamsLike = { get(name: string): string | null; getAll(name: string): string[] };

const toNumber = (v: string | null): number | null => {
  if (v === null || v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

/** URL -> filters. Works with useSearchParams() and URLSearchParams. */
export function parseFilters(params: ParamsLike): WatchFilters {
  return {
    q: params.get("q")?.trim() ?? "",
    brands: params.getAll("brand").filter(Boolean),
    category: params.get("category") || null,
    minPrice: toNumber(params.get("minPrice")),
    maxPrice: toNumber(params.get("maxPrice")),
  };
}

/** filters -> URL. Empty values are omitted so links stay clean. */
export function toSearchParams(f: WatchFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  f.brands.forEach((b) => p.append("brand", b));
  if (f.category) p.set("category", f.category);
  if (f.minPrice !== null) p.set("minPrice", String(f.minPrice));
  if (f.maxPrice !== null) p.set("maxPrice", String(f.maxPrice));
  return p;
}

export function getUniqueBrands(products: Product[]): string[] {
  const set = new Set<string>();
  for (const p of products) if (p.brand?.trim()) set.add(p.brand.trim());
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function getPriceBounds(products: Product[]): { min: number; max: number } | null {
  if (products.length === 0) return null;
  const prices = products.map((p) => p.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function applyFilters(products: Product[], f: WatchFilters): Product[] {
  const q = f.q.toLowerCase();
  const brands = f.brands.map((b) => b.toLowerCase());
  const category = f.category?.toLowerCase() ?? null;

  return products.filter((p) => {
    if (q) {
      const haystack = [p.name, p.brand, p.spec, p.description].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (brands.length && !brands.includes((p.brand ?? "").toLowerCase())) return false;
    if (category && (p.category ?? "").toLowerCase() !== category) return false;
    if (f.minPrice !== null && p.price < f.minPrice) return false;
    if (f.maxPrice !== null && p.price > f.maxPrice) return false;
    return true;
  });
}

export const hasActiveFilters = (f: WatchFilters) =>
  !!(f.q || f.brands.length || f.category || f.minPrice !== null || f.maxPrice !== null);
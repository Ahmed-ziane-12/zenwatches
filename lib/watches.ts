import "server-only";
import { getSupabase } from "./supabase";
import { artFor, type Product } from "./products";

// ---------------------------------------------------------------------------
// Everything that depends on database layout is in this block.
// ---------------------------------------------------------------------------
const TABLE = "products";
const COLUMNS = "id, name, price, currency, image, images, availability, stock, specs, colors, brand, category";

const POOL_LIMIT = 1000;

type ProductRow = {
  id: number | string;
  name: string;
  price: number | string;
  currency: string | null;
  image: string | null;
  images: unknown;
  availability: string | null;
  stock: number | null;
  specs: unknown;
  colors: unknown;
  brand?: string | null;
  category?: string | null;
};

const strings = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "") : [];

// Image values may be full URLs (Supabase Storage, a CDN) or paths like "images/rolex.jpg" from your static site.
// Paths are served from /public by default. Set PRODUCT_IMAGE_BASE_URL to load them from another site instead.
function imageUrlOf(row: ProductRow): string | null {
  const raw = (row.image?.trim() || strings(row.images)[0] || "").trim();
  if (!raw || /placeholder\.\w+$/i.test(raw)) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = process.env.PRODUCT_IMAGE_BASE_URL?.replace(/\/+$/, "");
  const path = raw.replace(/^\/+/, "");
  return base ? `${base}/${path}` : `/${path}`;
}

// `specs` is a free-form key/value object, so the short line under the name uses its first two values.
function specLine(specs: unknown): string {
  if (!specs || typeof specs !== "object" || Array.isArray(specs)) return "";
  return Object.values(specs as Record<string, unknown>)
    .filter((v): v is string | number => (typeof v === "string" && v.trim() !== "") || typeof v === "number")
    .slice(0, 2)
    .join(" · ");
}

function toProduct(row: ProductRow): Product {
  const id = String(row.id);
  const colors = strings(row.colors);
  return {
    id,
    name: row.name,
    spec: specLine(row.specs),
    price: Number(row.price),
    currency: row.currency || "DA",
    // Only name a color when the watch has just one. Choosing among several belongs on the product page.
    colorLabel: colors.length === 1 ? colors[0] : "",
    imageUrl: imageUrlOf(row),
    art: artFor(id),
    brand: row.brand || null,
    category: row.category || null,
    stock: row.stock,
    availability: row.availability,
    colors,
  } as Product;
}
// ---------------------------------------------------------------------------

/** Fisher-Yates shuffle. Returns a new array and leaves the input alone. */
export function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Picks `count` random active watches, including sold-out pieces so they can show their badge. */
export async function getRandomWatches(count = 15): Promise<Product[]> {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .select(COLUMNS)
    .eq("active", true)
    .limit(POOL_LIMIT)
    .overrideTypes<ProductRow[], { merge: false }>();

  if (error) throw new Error(`Supabase query failed: ${error.message}`);

  return shuffle(data ?? [])
    .slice(0, count)
    .map(toProduct);
}

export async function getAllWatches(): Promise<Product[]> {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .select(COLUMNS)
    .eq("active", true)
    .overrideTypes<ProductRow[], { merge: false }>();

  if (error) throw new Error(`Supabase query failed: ${error.message}`);

  return (data ?? []).map(toProduct);
}

export interface BrandSummary {
  name: string;
  count: number;
}

/** Brands that actually have active products, most stocked first. */
export async function getTopBrands(limit = 12): Promise<BrandSummary[]> {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .select("brand")
    .eq("active", true);

  if (error) throw new Error(`Supabase query failed: ${error.message}`);

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const name = typeof row.brand === "string" ? row.brand.trim() : "";
    if (!name) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}
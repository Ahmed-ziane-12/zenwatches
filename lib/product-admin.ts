// Shared product admin types and pure helpers.
// This file is imported by both the dashboard client pages and the API routes,
// so it must not import server-only modules.

export const PRODUCT_IMAGE_BUCKET = "product-images";
export const MAX_PRODUCT_IMAGES = 12;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export type ProductAvailability = "available" | "limited" | "sold-out";

export const AVAILABILITY_OPTIONS: ProductAvailability[] = [
  "available",
  "limited",
  "sold-out",
];

export interface ProductInput {
  name: string;
  brand: string | null;
  category: string;
  price: number;
  currency: string;
  description: string | null;
  full_description: string | null;
  badge: string | null;
  availability: ProductAvailability;
  stock: number | null;
  sort_order: number;
  active: boolean;
  colors: string[];
  specs: Record<string, string>;
}

export interface AdminProduct extends ProductInput {
  id: number;
  created_at?: string;
  image: string | null;
  images: string[];
}

function asText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function asOptionalText(value: unknown, maxLength: number): string | null {
  const text = asText(value, maxLength);
  return text || null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asInteger(value: unknown): number | null {
  const parsed = asNumber(value);
  if (parsed === null || !Number.isInteger(parsed)) return null;
  return parsed;
}

export function normalizeImages(row: { image?: unknown; images?: unknown }): string[] {
  const list: string[] = [];
  const seen = new Set<string>();

  if (Array.isArray(row.images)) {
    for (const entry of row.images) {
      if (typeof entry !== "string") continue;
      const value = entry.trim();
      if (!value || seen.has(value)) continue;
      seen.add(value);
      list.push(value);
    }
  }

  if (list.length === 0 && typeof row.image === "string" && row.image.trim()) {
    list.push(row.image.trim());
  }

  return list.slice(0, MAX_PRODUCT_IMAGES);
}

export function toAdminProduct(row: Record<string, unknown>): AdminProduct {
  const images = normalizeImages(row);
  const availability = AVAILABILITY_OPTIONS.includes(row.availability as ProductAvailability)
    ? (row.availability as ProductAvailability)
    : "available";

  const specs: Record<string, string> = {};
  if (row.specs && typeof row.specs === "object" && !Array.isArray(row.specs)) {
    for (const [key, value] of Object.entries(row.specs as Record<string, unknown>)) {
      if (typeof value === "string" || typeof value === "number") {
        specs[String(key)] = String(value);
      }
    }
  }

  const colors = Array.isArray(row.colors)
    ? row.colors
        .filter((entry): entry is string => typeof entry === "string" && entry.trim() !== "")
        .map((entry) => entry.trim())
    : [];

  return {
    id: Number(row.id),
    created_at: typeof row.created_at === "string" ? row.created_at : undefined,
    name: typeof row.name === "string" ? row.name : "",
    brand: typeof row.brand === "string" ? row.brand : null,
    category: typeof row.category === "string" ? row.category : "luxury",
    price: Number(row.price) || 0,
    currency: typeof row.currency === "string" && row.currency ? row.currency : "DA",
    description: typeof row.description === "string" ? row.description : null,
    full_description:
      typeof row.full_description === "string" ? row.full_description : null,
    badge: typeof row.badge === "string" ? row.badge : null,
    availability,
    stock: typeof row.stock === "number" ? row.stock : null,
    sort_order: typeof row.sort_order === "number" ? row.sort_order : 100,
    active: row.active !== false,
    colors,
    specs,
    image: images[0] ?? null,
    images,
  };
}

export type ParseResult =
  | { ok: true; data: ProductInput }
  | { ok: false; error: string };

export function parseProductInput(body: unknown): ParseResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Invalid request body" };
  }

  const source = body as Record<string, unknown>;

  const name = asText(source.name, 200);
  if (!name) return { ok: false, error: "Product name is required" };

  const price = asNumber(source.price);
  if (price === null || price < 0 || price > 100_000_000) {
    return { ok: false, error: "Price must be a positive number" };
  }

  const stockRaw = source.stock;
  let stock: number | null = null;
  if (stockRaw !== null && stockRaw !== undefined && String(stockRaw).trim() !== "") {
    stock = asInteger(stockRaw);
    if (stock === null || stock < 0 || stock > 1_000_000) {
      return { ok: false, error: "Stock must be a whole number of 0 or more" };
    }
  }

  const sortOrder = asInteger(source.sort_order ?? 100);
  if (sortOrder === null) {
    return { ok: false, error: "Sort order must be a whole number" };
  }

  const availability = AVAILABILITY_OPTIONS.includes(
    source.availability as ProductAvailability,
  )
    ? (source.availability as ProductAvailability)
    : "available";

  const colors: string[] = [];
  const colorSeen = new Set<string>();
  if (Array.isArray(source.colors)) {
    for (const entry of source.colors) {
      if (typeof entry !== "string") continue;
      const color = entry.trim().slice(0, 60);
      if (!color || colorSeen.has(color)) continue;
      colorSeen.add(color);
      colors.push(color);
      if (colors.length >= 24) break;
    }
  }

  const specs: Record<string, string> = {};
  let specCount = 0;
  if (source.specs && typeof source.specs === "object" && !Array.isArray(source.specs)) {
    for (const [rawKey, rawValue] of Object.entries(
      source.specs as Record<string, unknown>,
    )) {
      if (typeof rawValue !== "string" && typeof rawValue !== "number") continue;
      const key = rawKey.trim().slice(0, 80);
      const value = String(rawValue).trim().slice(0, 300);
      if (!key || !value) continue;
      specs[key] = value;
      specCount += 1;
      if (specCount >= 60) break;
    }
  }

  return {
    ok: true,
    data: {
      name,
      brand: asOptionalText(source.brand, 120),
      category: asText(source.category, 80) || "luxury",
      price,
      currency: asText(source.currency, 12) || "DA",
      description: asOptionalText(source.description, 2000),
      full_description: asOptionalText(source.full_description, 20000),
      badge: asOptionalText(source.badge, 120),
      availability,
      stock,
      sort_order: sortOrder,
      active: source.active !== false,
      colors,
      specs,
    },
  };
}

/** Returns the storage object path when the URL points at the product-images bucket. */
export function storagePathFromUrl(value: string): string | null {
  if (typeof value !== "string") return null;

  let pathname = value;
  try {
    pathname = new URL(value, "http://localhost").pathname;
  } catch {
    pathname = value;
  }

  const marker = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;
  const index = pathname.indexOf(marker);
  if (index === -1) return null;

  const encoded = pathname.slice(index + marker.length);
  if (!encoded) return null;

  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
}

/** Image URLs may be remote, absolute, or local paths such as "images/foo.jpg". */
export function imageSrc(value: string): string {
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:")) return value;
  return `/${value.replace(/^\/+/, "")}`;
}

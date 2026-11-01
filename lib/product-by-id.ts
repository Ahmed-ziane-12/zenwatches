import "server-only";
import { getSupabase } from "./supabase";
import { artFor, type Product, sampleProducts } from "./products";

const TABLE = "products";
const COLUMNS = "id, name, price, currency, image, images, availability, stock, specs, colors";

interface ProductRow {
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
}

function strings(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "") : [];
}

function imageUrlOf(row: ProductRow): string | null {
  const raw = (row.image?.trim() || strings(row.images)[0] || "").trim();
  if (!raw || /placeholder\.\w+$/i.test(raw)) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = process.env.PRODUCT_IMAGE_BASE_URL?.replace(/\/+$/, "");
  const path = raw.replace(/^\/+/, "");
  return base ? `${base}/${path}` : `/${path}`;
}

function specLine(specs: unknown): string {
  if (!specs || typeof specs !== "object" || Array.isArray(specs)) return "";
  return Object.values(specs as Record<string, unknown>)
    .filter((v): v is string | number => (typeof v === "string" && v.trim() !== "") || typeof v === "number")
    .slice(0, 2)
    .join(" · ");
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await getSupabase()
      .from(TABLE)
      .select(COLUMNS)
      .eq("id", id)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const row = data as ProductRow;
    const colorsArr = strings(row.colors);
    const image = imageUrlOf(row);
    return {
      id: String(row.id),
      name: row.name,
      spec: specLine(row.specs),
      price: Number(row.price),
      currency: row.currency || "DA",
      colorLabel: colorsArr.length === 1 ? colorsArr[0] : "",
      imageUrl: image,
      image,
      images: strings(row.images).length > 0 ? strings(row.images) : image ? [image] : [],
      brand: (row as any).brand || null,
      description: (row as any).description || null,
      movement: (row as any).movement || (row.specs as any)?.movement || null,
      caseSize: (row as any).caseSize || (row.specs as any)?.caseSize || null,
      waterResistance: (row as any).waterResistance || (row.specs as any)?.waterResistance || null,
      specs: typeof row.specs === "object" && !Array.isArray(row.specs) ? (row.specs as Record<string, any>) : null,
      colors: colorsArr,
      availability: (row as any).availability || null,
      stock: typeof row.stock === "number" ? row.stock : null,
      art: artFor(String(row.id)),
    };
  } catch (e) {
    const products = sampleProducts();
    return products.find((p) => p.id === id) || null;
  }
}

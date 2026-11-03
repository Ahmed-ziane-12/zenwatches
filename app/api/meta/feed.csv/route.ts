import { getSupabase } from "@/lib/supabase";

// Meta Commerce Manager fetches this URL on a schedule. One hour of caching is enough
// for stock and price changes while keeping Supabase reads low.
export const revalidate = 3600;

const DEFAULT_LOCALE = process.env.META_FEED_LOCALE || "ar";
const FEED_BRAND = process.env.META_FEED_BRAND || "Zen Watches";
const FEED_CURRENCY = process.env.META_FEED_CURRENCY || "DZD";

const csv = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

function plainText(value: unknown): string {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function siteUrl(request: Request): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.META_FEED_SITE_URL;
  if (configured) return configured.replace(/\/+$/, "");
  return new URL(request.url).origin.replace(/\/+$/, "");
}

function firstImage(images: unknown): string {
  return Array.isArray(images)
    ? images.find((value): value is string => typeof value === "string" && value.trim() !== "") ?? ""
    : "";
}

function absoluteImage(raw: unknown, site: string): string {
  if (typeof raw !== "string" || !raw.trim()) return "";
  const value = raw.trim();
  if (/^https?:\/\//i.test(value)) return value;
  const base = (process.env.PRODUCT_IMAGE_BASE_URL || site).replace(/\/+$/, "");
  try {
    return new URL(value.replace(/^\/+/, ""), `${base}/`).toString();
  } catch {
    return "";
  }
}

function availabilityOf(product: { stock: unknown; availability: unknown }): string {
  const stock = Number(product.stock);
  if (Number.isFinite(stock)) {
    return stock > 0 ? "in stock" : "out of stock";
  }
  return product.availability === "sold-out" ? "out of stock" : "in stock";
}

export async function GET(request: Request) {
  const expectedToken = process.env.META_FEED_TOKEN;
  if (!expectedToken) {
    return new Response(
      "META_FEED_TOKEN is not configured on the server.",
      { status: 500 },
    );
  }

  const token = new URL(request.url).searchParams.get("token");
  if (token !== expectedToken) {
    return new Response("Forbidden", { status: 403 });
  }

  const { data, error } = await getSupabase()
    .from("products")
    .select(
      "id,name,description,full_description,price,image,images,stock,availability,brand,active",
    )
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[api/meta/feed]", error);
    return new Response("Could not build the feed.", { status: 500 });
  }

  const site = siteUrl(request);
  const header = [
    "id",
    "title",
    "description",
    "availability",
    "condition",
    "price",
    "link",
    "image_link",
    "brand",
  ].join(",");

  const rows = (data ?? []).flatMap((product) => {
    const title = plainText(product.name);
    const description = plainText(
      product.full_description || product.description,
    ).slice(0, 4900);
    const image = absoluteImage(product.image || firstImage(product.images), site);
    const price = Number(product.price);

    // Meta rejects items missing required fields; leave them out instead of breaking the feed.
    if (!title || !description || !image || !Number.isFinite(price) || price <= 0) {
      return [];
    }

    return [
      [
        csv(String(product.id)),
        csv(title),
        csv(description),
        csv(availabilityOf(product)),
        "new",
        csv(`${price.toFixed(2)} ${FEED_CURRENCY}`),
        csv(`${site}/${DEFAULT_LOCALE}/product/${product.id}`),
        csv(image),
        csv(product.brand || FEED_BRAND),
      ].join(","),
    ];
  });

  return new Response([header, ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'inline; filename="meta-catalog.csv"',
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=600",
      "X-Robots-Tag": "noindex",
    },
  });
}

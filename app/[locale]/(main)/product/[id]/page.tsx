import type { Metadata } from "next";
import { getProductById } from "@/lib/product-by-id";
import ProductDetail from "@/components/ProductDetail/ProductDetail";
import { notFound } from "next/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");

function absoluteImage(value?: string | null): string | undefined {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  if (!SITE_URL) return undefined;
  try {
    return new URL(value.replace(/^\/+/, ""), `${SITE_URL}/`).toString();
  } catch {
    return undefined;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return { title: "Product not found" };
  }

  const description = product.description || product.spec || undefined;
  const image = absoluteImage(product.imageUrl);
  const url = SITE_URL ? `${SITE_URL}/${locale}/product/${product.id}` : undefined;

  return {
    title: product.name,
    description,
    alternates: url ? { canonical: url } : undefined,
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url,
      images: image ? [{ url: image, width: 1080, height: 1080, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const resolvedParams = await params;
  const product = await getProductById(resolvedParams.id);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}

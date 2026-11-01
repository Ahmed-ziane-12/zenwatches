import { getProductById } from "@/lib/product-by-id";
import ProductDetail from "@/components/ProductDetail/ProductDetail";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const resolvedParams = await params;
  const product = await getProductById(resolvedParams.id);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}

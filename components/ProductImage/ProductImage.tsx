import Image from "next/image";
import type { Product } from "@/lib/products";
import WatchArt from "@/components/WatchArt/WatchArt";
import styles from "./ProductImage.module.css";

interface ProductImageProps {
  product: Product;
  /** Class for the SVG fallback and the photo wrapper, so each caller controls spacing. */
  className?: string;
  /** Pass false for decorative copies that are hidden from screen readers. */
  labelled?: boolean;
  /** Tells next/image how wide the picture renders, so it downloads a small enough file. */
  sizes: string;
}

// Shows the product photo when there is one, otherwise the SVG drawing for that watch.
export default function ProductImage({ product, className = "", labelled = true, sizes }: ProductImageProps) {
  const label = labelled ? `${product.name}${product.colorLabel ? `, ${product.colorLabel}` : ""}` : undefined;

  if (product.imageUrl) {
    return (
      <div className={`${styles.wrap} ${className}`}>
        <Image
          src={product.imageUrl}
          alt={label ?? ""}
          fill
          sizes={sizes}
          // Photos on other hosts (Supabase Storage, a CDN) load straight from there so no host list is needed.
          // Local /public images still go through Next's optimizer.
          unoptimized={/^https?:\/\//i.test(product.imageUrl)}
          className={styles.photo}
        />
      </div>
    );
  }

  return <WatchArt model={product.art.model} cw={product.art.cw} label={label} className={className} />;
}

'use client'
import React from 'react'
import styles from './ProductCard.module.css'
import { useCart } from '../CartProvider';
import { useLanguage } from '../LanguageProvider';
import { formatPrice, isProductLowStock, isProductSoldOut, productStockOf, Product } from '@/lib/products';
import ProductImage from '../ProductImage/ProductImage';
import Link from 'next/link';
import { Plus } from 'lucide-react';

type ProductCardProps = {
  product: Product;
};

const ProductCard = ({ product }: ProductCardProps) => {
  const { add } = useCart();
  const { t, locale } = useLanguage();
  const p: any = product as any;

  if (!product) {
    return null;
  }

  const stock = productStockOf(product);
  const isOutOfStock = isProductSoldOut(product);
  const isLowStock = isProductLowStock(product);
  const brand = p.brand || t("productCard.noBrand");

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    add(product);
  };

  const price =
    typeof product.price === "number"
      ? formatPrice(product.price, product.currency || "DA")
      : `${product.price}${product.currency || "DA"}`;

  return (
    <article className={styles.productCard}>
      <Link
        href={`/${locale}/product/${product.id}`}
        className={styles.media}
        aria-label={`${product.name} — ${brand}`}
      >
        <ProductImage
          product={product}
          labelled={false}
          sizes="(max-width: 480px) 85vw, (max-width: 768px) 45vw, (max-width: 1200px) 30vw, 18vw"
          className={styles.mediaImage}
        />

        {(isOutOfStock || isLowStock) && (
          <span className={`${styles.badge} ${isOutOfStock ? styles.badgeOut : styles.badgeLow}`}>
            {isOutOfStock
              ? t("productCard.soldOut")
              : t("productCard.lowStockShort", { count: stock ?? 0 })}
          </span>
        )}
      </Link>

      <div className={styles.productInfo}>
        <span className={styles.brand}>{brand}</span>
        <Link href={`/${locale}/product/${product.id}`} className={styles.productName}>{product.name}</Link>
        {product.spec && <p className={styles.productSpec}>{product.spec}</p>}

        <div className={styles.productFooter}>
          <p className={styles.productPrice} dir="ltr">{price}</p>
          <button
            type="button"
            className={styles.addToCartButton}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label={
              isOutOfStock
                ? `${t("productCard.soldOut")}: ${product.name}`
                : `${t("productCard.addToCart")}: ${product.name}`
            }
            title={isOutOfStock ? t("productCard.soldOut") : t("productCard.addToCart")}
          >
            <Plus size={17} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProductCard

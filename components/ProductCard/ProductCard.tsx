'use client'
import React from 'react'
import styles from './ProductCard.module.css'
import { useCart } from '../CartProvider';
import { useLanguage } from '../LanguageProvider';
import { Product } from '@/lib/products';
import Link from 'next/link';

type ProductCardProps = {
  product: Product;
};

const ProductCard = ({ product }: ProductCardProps) => {
  const { add } = useCart();
  const { t } = useLanguage();
  const p: any = product as any;

  if (!product) {
    return null;
  }

  const stock = p.stock !== undefined && p.stock !== null ? Number(p.stock) : null;
  const isOutOfStock = stock !== null && stock <= 0;
  const isLowStock = stock !== null && stock > 0 && stock < 3;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    add(product);
  };

  const price = product.price?.toFixed ? product.price.toFixed(2) : product.price;

  return (
    <article className={styles.productCard}>
      <Link href={`/product/${product.id}`} className={styles.productImage}>
        <img src={product.imageUrl ? product.imageUrl : "/images/product.jpg"} alt={product.name} />
      </Link>

      <div className={styles.productInfo}>
        <div className={styles.productBody}>
          <div className={styles.productName}>
            <h3>{product.name}</h3>
            <span className={styles.productRating}>{p.brand || t("productCard.noBrand")}</span>
          </div>
          <p className={styles.productSpec}>{product.spec}</p>
          {/* Reserved slot so a missing stock label never shifts the footer. */}
          <p className={`${styles.stockLabel} ${isOutOfStock ? styles.stockOut : isLowStock ? styles.stockLow : ""}`}>
            {isOutOfStock ? t("productCard.soldOut") : isLowStock ? t("productCard.lowStock", { count: stock ?? 0 }) : ""}
          </p>
        </div>

        <div className={styles.productFooter}>
          <p className={styles.productPrice}>{price}{product.currency || "DA"}</p>
          <button
            type="button"
            className={styles.addToCartButton}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? t("productCard.soldOut") : t("productCard.addToCart")}
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProductCard

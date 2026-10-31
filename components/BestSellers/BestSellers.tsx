"use client";

import { Product } from '@/lib/products'
import React, { useRef } from 'react'
import styles from './BestSellers.module.css'
import ProductCard from '../ProductCard/ProductCard'
import { useLanguage } from '@/components/LanguageProvider'
import { ChevronLeft, ChevronRight } from "lucide-react";

type BestSellersProps = {
  products: Product[];
};

const BestSellers = ({ products }: BestSellersProps) => {
  const { t } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: -1 | 1) => {
    const el = trackRef.current;
    const card = el?.firstElementChild as HTMLElement | null | undefined;
    if (el && card) {
      el.scrollBy({ left: dir * (card.offsetWidth + 16), behavior: "smooth" });
    }
  };

  if (products.length === 0) return null;

  return (
    <div className={styles.bestSellers}>
      <div className={styles.header}>
        <h2>{t("bestSellers.title")}</h2>
        <div className={styles.controls}>
          <button type="button" onClick={() => scroll(-1)} aria-label="Previous" className={styles.controlBtn}>
            <ChevronLeft size={17} />
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label="Next" className={styles.controlBtn}>
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
      <div ref={trackRef} className={styles.track}>
        {products.map((product) => (
          <div key={product.id} className={styles.card}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      <div className={styles.productGrid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

export default BestSellers
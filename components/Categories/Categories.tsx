"use client";

import React from 'react'
import styles from './Categories.module.css'
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

const TILES = [
  { labelKey: "categories.mens", href: "/shop/category/mens", image: "/images/men.avif" },
  { labelKey: "categories.womens", href: "/shop/category/womens", image: "/images/women.avif" },
  { labelKey: "categories.smart", href: "/shop/category/smart", image: "/images/smart.avif" },
  { labelKey: "categories.accessories", href: "/shop/category/accessories", image: "/images/accessories.avif" },
  { labelKey: "categories.luxury", href: "/shop/collection/luxury", image: "/images/luxury.avif" },
];


const Categories = () => {
  const { t } = useLanguage();

  return (
    <section className={styles.categories}>
        <div className={styles.sectionTitle}>
        <h2>{t("categories.title")}</h2>
        <Link href="/shop/category" className={styles.exploreLink}>
          {t("categories.exploreAll")} <ArrowRight size={15} />
        </Link>
      </div>
      <div className={styles.tilesContainer}>
        <ul className={styles.list}>
            {TILES.map((tile, index) => (
              <li key={index} className={styles.listItem}>
                <Link href={tile.href} className={styles.tileLink}>
                    <div className={styles.tileImageContainer}>
                        <img
                            src={tile.image}
                            alt=""
                            loading="lazy"
                            className={styles.tileImage}
                        />
                    </div>
                    <div className={styles.tileFooter}>
                        <span className={styles.tileLabel}>{t(tile.labelKey as any)}</span>
                        <ArrowUpRight size={15} className={styles.tileArrow} />
                    </div>
                </Link>
              </li>
                ))}
        </ul>
        </div>
        
    </section>
  )
}

export default Categories
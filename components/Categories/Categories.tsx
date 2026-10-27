import React from 'react'
import styles from './Categories.module.css'
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

const TILES = [
  { label: "Men's Watches", href: "/shop/category/mens", image: "/images/men.avif" },
  { label: "Women's Watches", href: "/shop/category/womens", image: "/images/women.avif" },
  { label: "Smart Watches", href: "/shop/category/smart", image: "/images/smart.avif" },
  { label: "Watch Accessories", href: "/shop/category/accessories", image: "/images/accessories.avif" },
  { label: "Luxury Brands", href: "/shop/collection/luxury", image: "/images/luxury.avif" },
];


const Categories = () => {
  return (
    <section className={styles.categories}>
        <div className={styles.sectionTitle}>
        <h2>Shop by Category</h2>
        <Link href="/shop/category" className={styles.exploreLink}>
          Explore All <ArrowRight size={15} />
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
                        <span className={styles.tileLabel}>{tile.label}</span>
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
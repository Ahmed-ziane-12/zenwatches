import React from 'react'
import styles from './PromoBanners.module.css'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

const PromoBanners = () => {
  return (
    <section className={styles.container}>
        <div className={styles.banner}>
            <img src="/images/banner1.avif" alt="Promo Banner" className={styles.bannerImage} />
            <div className={styles.heroGradient} />
            <p className={styles.promoDescription}>Up to 40% Off</p>
            <h2 className={styles.promoTitle}>Luxury Watches</h2>
            <p className={styles.promoDescription}>Style in Every Second</p>
            <Link href="/shop/collection/luxury" className={styles.promoButton}>
                Shop Now <ArrowRight size={15} />
            </Link>
        </div>
        <div className={styles.banner}>
            <img src="/images/banner2.avif" alt="Promo Banner" className={styles.bannerImage} />
            <div className={styles.heroGradient1} />
            <p className={styles.promoDescription}>Elegant</p>
            <h2 className={styles.promoTitle}>Women's Watches</h2>
            <p className={styles.promoDescription}>Style in Every Second</p>

            <Link href="/shop/collection/luxury" className={styles.promoButton}>
                Shop Now <ArrowRight size={15} />
            </Link>
        </div>
    </section>
  )
}

export default PromoBanners
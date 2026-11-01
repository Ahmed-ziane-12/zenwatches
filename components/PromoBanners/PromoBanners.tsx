"use client";

import React from 'react'
import styles from './PromoBanners.module.css'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/components/LanguageProvider'

const PromoBanners = () => {
  const { t } = useLanguage();

  return (
    <section className={styles.container}>
        <div className={styles.banner}>
            <img src="/images/banner1.avif" alt="Promo Banner" className={styles.bannerImage} />
            <div className={styles.heroGradient} />
            <p className={styles.promoDescription}>{t("promo.upTo40")}</p>
            <h2 className={styles.promoTitle}>{t("promo.luxuryWatches")}</h2>
            <p className={styles.promoDescription}>{t("promo.styleEverySecond")}</p>
            <Link href="/shop/collection/luxury" className={styles.promoButton}>
                {t("promo.shopNow")} <ArrowRight size={15} />
            </Link>
        </div>
        <div className={styles.banner}>
            <img src="/images/banner2.avif" alt="Promo Banner" className={styles.bannerImage} />
            <div className={styles.heroGradient1} />
            <p className={styles.promoDescription}>{t("promo.elegant")}</p>
            <h2 className={styles.promoTitle}>{t("promo.womensWatches")}</h2>
            <p className={styles.promoDescription}>{t("promo.styleEverySecond")}</p>

            <Link href="/shop/collection/luxury" className={styles.promoButton}>
                {t("promo.shopNow")} <ArrowRight size={15} />
            </Link>
        </div>
    </section>
  )
}

export default PromoBanners
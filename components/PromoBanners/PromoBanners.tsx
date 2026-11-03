"use client";

import React from 'react'
import styles from './PromoBanners.module.css'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useLanguage } from '@/components/LanguageProvider'

const PromoBanners = () => {
  const { t } = useLanguage();
  const params = useParams();
  const locale = (params?.locale as string) || "ar";

  return (
    <section className={styles.container}>
        <div className={styles.banner}>
            <img src="/images/banner1.avif" alt="" className={styles.bannerImage} />
            <div className={styles.heroGradient} />
            <p className={styles.promoDescription}>{t("promo.upTo40")}</p>
            <h2 className={styles.promoTitle}>{t("promo.whenBuyingCollection")}</h2>
            <p className={styles.promoDescription}>{t("promo.morePiecesMoreSave")}</p>
            <Link href={`/${locale}/collection`} className={styles.promoButton}>
                {t("promo.shopNow")} <ArrowRight size={15} />
            </Link>
        </div>
        <div className={styles.banner}>
            <img src="/images/banner2.avif" alt="" className={styles.bannerImage} />
            <div className={styles.heroGradient1} />
            <p className={styles.promoDescription}>{t("promo.elegant")}</p>
            <h2 className={styles.promoTitle}>{t("promo.womensWatches")}</h2>
            <p className={styles.promoDescription}>{t("promo.styleEverySecond")}</p>

            <Link href={`/${locale}/watches?category=women`} className={styles.promoButton}>
                {t("promo.shopNow")} <ArrowRight size={15} />
            </Link>
        </div>
    </section>
  )
}

export default PromoBanners

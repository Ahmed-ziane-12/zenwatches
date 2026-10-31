"use client";

import React from 'react'
import styles from './Contact.module.css'
import { useLanguage } from '@/components/LanguageProvider'

const Contact = () => {
  const { t } = useLanguage();

  return (
    <div className={styles.banner}>
      <img src="/contact.avif" alt="Promo Banner" className={styles.bannerImage} />
      <div className={styles.heroGradient} />
      <p className={styles.promoDescription}>Have questions? We're here to help!</p>
      <h2 className={styles.promoTitle}>{t("contact.title")}</h2>
      <p className={styles.promoDescription}>Get in touch with our team</p>
      <form className={styles.contactForm}>
        <input type="text" placeholder={t("contact.name")} className={styles.contactInput} />
        <input type="email" placeholder={t("contact.email")} className={styles.contactInput} />
        <textarea placeholder={t("contact.message")} className={styles.contactTextarea}></textarea>
        <button type="submit" className={styles.contactButton}>{t("contact.send")}</button>
      </form>
      <p className={styles.promoDescription}>Or reach us at:</p>
      <p className={styles.promoDescription}>Email:   <a href="mailto:info@zenwatches.com">info@zenwatches.com</a></p>
    </div>
  )
}

export default Contact
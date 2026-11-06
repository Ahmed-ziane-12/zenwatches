"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./Footer.module.css";

export default function Footer() {
  const { language, t } = useLanguage();
  const locale = language === "AR" ? "ar" : language === "EN" ? "en" : "fr";

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandSection}>
          <Link href={`/${locale}`} className={styles.brand}>
            <Image src={"/images/logo.jpg"} alt="Zen Watches" width={60} height={60} />
          </Link>
          <p className={styles.description}>
            {t("footer.description")}
          </p>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t("nav.shop")}</h3>
          <ul className={styles.links}>
            <li><Link href={`/${locale}/watches`} className={styles.link}>{t("nav.watches")}</Link></li>
            <li><a href="#" className={styles.link}>{t("nav.straps")}</a></li>
            <li><Link href={`/${locale}/collection`} className={styles.link}>{t("nav.collection")}</Link></li>
          </ul>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t("nav.help")}</h3>
          <ul className={styles.links}>
            <li><Link href={`/${locale}/help`} className={styles.link}>{t("nav.help")}</Link></li>
            <li><a href="#" className={styles.link}>{t("contact.title")}</a></li>
            <li><a href="#" className={styles.link}>{t("footer.shippingReturns")}</a></li>
          </ul>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t("nav.company")}</h3>
          <ul className={styles.links}>
            <li><a href="#" className={styles.link}>{t("footer.about")}</a></li>
            <li><Link href={`/${locale}/help`} className={styles.link}>{t("nav.journal")}</Link></li>
            <li><Link href={`/${locale}/privacy`} className={styles.link}>{t("footer.privacy")}</Link></li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomContainer}>
          <p className={styles.copyright}>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}

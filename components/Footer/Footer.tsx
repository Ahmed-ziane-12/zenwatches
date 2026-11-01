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
          <Link href="/" className={styles.brand}>
            <Image src={"/images/logo.jpg"} alt="Hourwright" width={60} height={60} />
          </Link>
          <p className={styles.description}>
            Automatic, hand-wound and quartz watches from independent makers.
          </p>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t("nav.shop")}</h3>
          <ul className={styles.links}>
            <li><a href="#" className={styles.link}>{t("nav.watches")}</a></li>
            <li><a href="#" className={styles.link}>{t("nav.straps")}</a></li>
            <li><a href="#" className={styles.link}>{t("nav.makers")}</a></li>
          </ul>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t("nav.help")}</h3>
          <ul className={styles.links}>
            <li><Link href={`/${locale}/help`} className={styles.link}>{t("nav.help")}</Link></li>
            <li><a href="#" className={styles.link}>{t("contact.title")}</a></li>
            <li><a href="#" className={styles.link}>Shipping & Returns</a></li>
          </ul>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t("nav.company")}</h3>
          <ul className={styles.links}>
            <li><a href="#" className={styles.link}>About Us</a></li>
            <li><a href={`/${locale}/help`} className={styles.link}>{t("nav.journal")}</a></li>
            <li><a href="#" className={styles.link}>Privacy Policy</a></li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomContainer}>
          <p className={styles.copyright}>© {new Date().getFullYear()} Hourwright. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

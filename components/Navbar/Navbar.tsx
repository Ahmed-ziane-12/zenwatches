"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import { useCart } from "../CartProvider";
import { useLanguage } from "../LanguageProvider";
import styles from "./Navbar.module.css";
import Image from "next/image";
import { ShoppingBag, Menu, X, ChevronDown, ChevronUp, User } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../AuthProvider/AuthProvider";
import ProfileDropdown from "../ProfileDropdown/ProfileDropdown";

const LANGUAGES = ["AR", "EN", "FR"] as const;

export default function Navbar() {
  const { count, open } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const locale = language === "AR" ? "ar" : language === "EN" ? "en" : "fr";

  const itemText = t(count === 1 ? "aria.itemOne" : "aria.itemMany");

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label={t("navbar.mainNav")}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? t("aria.closeMenu") : t("aria.openMenu")}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <ul className={styles.links}>
          <li><a href={`/${locale}/watches`}>{t("nav.watches")}</a></li>
          <li><a href={`/${locale}/collection`}>{t("nav.collection")}</a></li>
          <li><a href={`/${locale}/help`}>{t("nav.help")}</a></li>
        </ul>

        <Link className={styles.brand} href={`/${locale}`}>
          <Image src={"/images/logo.jpg"} alt={""} width={80} height={80} />
        </Link>

        <div className={styles.actions}>
          <div className={styles.langWrapper}>
            <button
              type="button"
              className={styles.langButton}
              onClick={() => setLangOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              aria-label={t("aria.selectLanguage")}
            >
              <span suppressHydrationWarning>{language}</span>
              {langOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.ul
                  className={styles.langMenu}
                  role="listbox"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                >
                  {LANGUAGES.map((lang) => (
                    <li key={lang} role="option" aria-selected={language === lang}>
                      <button
                        type="button"
                        className={styles.langItem}
                        onClick={() => {
                          setLanguage(lang);
                          setLangOpen(false);
                        }}
                      >
                        {lang}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
          <ThemeToggle />
          <button
            type="button"
            className={styles.cart}
            onClick={open}
            aria-label={t("aria.openBag", { count, itemText })}
          >
            <ShoppingBag size={20} />
            <span className={styles.cartLabel}>{t("nav.bag")}</span>
            {/* Keyed on count so the badge replays its bump each time an item is added. */}
            <span key={count} className={`${styles.badge} ${count > 0 ? styles.badgeOn : ""}`} aria-hidden="true">
              {count}
            </span>
          </button>
          <div className={styles.authSlot}>
            <AnimatePresence mode="wait" initial={false}>
              {authLoading ? (
                <motion.span
                  key="auth-loading"
                  className={styles.authLoading}
                  aria-hidden="true"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <motion.span
                    className={styles.spinner}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                </motion.span>
              ) : user ? (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <ProfileDropdown />
                </motion.div>
              ) : (
                <motion.div
                  key="signin"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <Link
                    href={`/${locale}/signin`}
                    className={`${styles.cart} ${styles.signIn}`}
                  >
                    <User size={18} />
                    <span className={styles.signInLabel}>{t("navbar.signIn")}</span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className={styles.mobileMenu} role="menu">
          <ul className={styles.mobileLinks}>
            <li role="menuitem">
              <a href={`/${locale}/watches`} onClick={() => setMenuOpen(false)}>
                {t("nav.watches")}
              </a>
            </li>
            <li role="menuitem">
              <a href={`/${locale}/collection`} onClick={() => setMenuOpen(false)}>
                {t("nav.collection")}
              </a>
            </li>
            <li role="menuitem">
              <a href={`/${locale}/help`} onClick={() => setMenuOpen(false)}>
                {t("nav.help")}
              </a>
            </li>
            <li>
              <button
                type="button"
                className={styles.cart2}
                onClick={() => { open(); setMenuOpen(false); }}
                aria-label={t("aria.openBag", { count, itemText })}
              >
                <ShoppingBag size={20} />
                <span className={styles.cartLabel}>{t("nav.bag")}</span>
                {/* Keyed on count so the badge replays its bump each time an item is added. */}
                <span key={count} className={`${styles.badge} ${count > 0 ? styles.badgeOn : ""}`} aria-hidden="true">
                  {count}
                </span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

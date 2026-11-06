"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, LayoutDashboard, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "../AuthProvider/AuthProvider";
import { useLanguage } from "../LanguageProvider";
import styles from "./ProfileDropdown.module.css";

function initials(value: string): string {
  const parts = value.trim().split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function ProfileDropdown() {
  const { user, signOut } = useAuth();
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const locale = language === "AR" ? "ar" : language === "EN" ? "en" : "fr";

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!user) return null;

  const isAdmin = user.role === "admin" || user.role === "super_admin";
  const monogram = initials(user.username || user.email);

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <motion.button
        type="button"
        className={`${styles.avatarButton} ${isOpen ? styles.avatarButtonOpen : ""}`}
        onClick={() => setIsOpen((open) => !open)}
        aria-label={t("profile.userMenu")}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        whileTap={{ scale: 0.97 }}
      >
        <span className={styles.avatar} aria-hidden="true">
          {monogram}
        </span>
        <ChevronDown size={14} className={styles.chevron} aria-hidden="true" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.menu}
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className={styles.userInfo}>
              <span className={styles.avatarLarge} aria-hidden="true">
                {monogram}
              </span>
              <div className={styles.userText}>
                <div className={styles.username}>{user.username}</div>
                <div className={styles.email}>{user.email}</div>
              </div>
              {isAdmin && (
                <span className={styles.roleChip}>
                  <ShieldCheck size={12} aria-hidden="true" />
                  {t("profile.admin")}
                </span>
              )}
            </div>

            <div className={styles.divider} />

            {isAdmin ? (
              <>
                <Link
                  href={`/${locale}/dashboard`}
                  className={styles.menuItem}
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard size={16} className={styles.menuIcon} aria-hidden="true" />
                  <span>{t("profile.dashboard")}</span>
                </Link>
                <div className={styles.divider} />
              </>
            ) : (
              <>
                <Link
                  href={`/${locale}/profile`}
                  className={styles.menuItem}
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                >
                  <UserRound size={16} className={styles.menuIcon} aria-hidden="true" />
                  <span>{t("profile.myProfile")}</span>
                </Link>
                <div className={styles.divider} />
              </>
            )}

            <button
              type="button"
              className={`${styles.menuItem} ${styles.signOut}`}
              role="menuitem"
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
            >
              <LogOut size={16} className={styles.menuIcon} aria-hidden="true" />
              <span>{t("profile.signOut")}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

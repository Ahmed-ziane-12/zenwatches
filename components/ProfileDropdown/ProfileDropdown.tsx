"use client";

import { useState, useRef, useEffect } from "react";
import { User, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../AuthProvider/AuthProvider";
import { useLanguage } from "../LanguageProvider";
import Link from "next/link";
import styles from "./ProfileDropdown.module.css";

export default function ProfileDropdown() {
  const { user, signOut } = useAuth();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const locale = language === "AR" ? "ar" : language === "EN" ? "en" : "fr";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user) return null;

  const isAdmin = user.role === "admin" || user.role === "super_admin";

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <button
        className={styles.avatarButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
      >
        <User size={18} />
      </button>

      {isOpen && (
        <div className={styles.menu}>
          <div className={styles.userInfo}>
            <div className={styles.username}>{user.username}</div>
            <div className={styles.email}>{user.email}</div>
          </div>
          <div className={styles.divider} />
          {isAdmin && (
            <>
              <Link href={`/${locale}/dashboard`} className={styles.menuItem} onClick={() => setIsOpen(false)}>
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>
              <div className={styles.divider} />
            </>
          )}
          <button className={styles.menuItem} onClick={() => { signOut(); setIsOpen(false); }}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}

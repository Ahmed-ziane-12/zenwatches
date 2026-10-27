"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import { useCart } from "../CartProvider";
import styles from "./Navbar.module.css";
import Image from "next/image";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { count, open } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main">
        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <ul className={styles.links}>
          <li><a href="#">Watches</a></li>
          <li><a href="#">Straps</a></li>
          <li><a href="#">Makers</a></li>
          <li><a href="#">Journal</a></li>
        </ul>

        <Link className={styles.brand} href="/">
          <Image src={"/images/logo.jpg"} alt={""} width={80} height={80} />
        </Link>

        <div className={styles.actions}>
          <ThemeToggle />
          <button
            type="button"
            className={styles.cart}
            onClick={open}
            aria-label={`Open bag, ${count} ${count === 1 ? "item" : "items"}`}
          >
            <ShoppingBag size={20} />
            <span className={styles.cartLabel}>Bag</span>
            {/* Keyed on count so the badge replays its bump each time an item is added. */}
            <span key={count} className={`${styles.badge} ${count > 0 ? styles.badgeOn : ""}`} aria-hidden="true">
              {count}
            </span>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className={styles.mobileMenu} role="menu">
          <ul className={styles.mobileLinks}>
            <li role="menuitem">
              <a href="#" onClick={() => setMenuOpen(false)}>
                Watches
              </a>
            </li>
            <li role="menuitem">
              <a href="#" onClick={() => setMenuOpen(false)}>
                Straps
              </a>
            </li>
            <li role="menuitem">
              <a href="#" onClick={() => setMenuOpen(false)}>
                Makers
              </a>
            </li>
            <li role="menuitem">
              <a href="#" onClick={() => setMenuOpen(false)}>
                Journal
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

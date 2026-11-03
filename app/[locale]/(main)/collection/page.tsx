
import type { Metadata } from "next";
import Link from "next/link";
import { PackageOpen } from "lucide-react";
import styles from "./collection.module.css";

export const metadata: Metadata = {
  title: "Collection",
  description: "Special packs and deals.",
};

export default function CollectionPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Collection</h1>
      <p className={styles.subtitle}>Special packs and deals</p>

      <div className={styles.empty}>
        <PackageOpen className={styles.icon} size={48} strokeWidth={1.5} aria-hidden="true" />
        <p className={styles.message}>No collections yet</p>
        <p className={styles.hint}>Check back soon, or browse our watches in the meantime.</p>
        <Link href="/watches" className={styles.button}>
          Browse watches
        </Link>
      </div>
    </main>
  );
}
"use client";

import { useAuth } from "@/components/AuthProvider/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Home, ShoppingCart } from "lucide-react";
import styles from "./dashboard.module.css";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || (user.role !== "admin" && user.role !== "super_admin"))) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ minHeight: "calc(100vh - 200px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <LoadingSpinner size={32} text="Loading..." />
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return null;
  }

  const getBasePath = () => {
    const match = pathname.match(/\/[a-z]{2}\/dashboard/);
    return match ? match[0] : "/ar/dashboard";
  };

  const basePath = getBasePath();

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Dashboard</h2>
        </div>
        <nav className={styles.nav}>
          <Link href={basePath} className={`${styles.navLink} ${pathname === basePath ? styles.navLinkActive : ""}`}>
            <Home size={18} />
            <span>Main</span>
          </Link>
          <Link href={`${basePath}/orders`} className={`${styles.navLink} ${pathname.includes("/orders") ? styles.navLinkActive : ""}`}>
            <ShoppingCart size={18} />
            <span>Orders</span>
          </Link>
        </nav>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}

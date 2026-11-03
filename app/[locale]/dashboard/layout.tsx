"use client";

import { useAuth } from "@/components/AuthProvider/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  Home,
  ShoppingCart,
  LogOut,
  ShieldCheck,
  Store,
  Watch,
} from "lucide-react";
import styles from "./dashboard.module.css";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";

function initials(name?: string) {
  if (!name) return "AD";
  return name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || (user.role !== "admin" && user.role !== "super_admin"))) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <LoadingSpinner size={32} text="Loading dashboard..." />
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return null;
  }

  const locale = pathname.match(/^\/([a-z]{2})(?:\/|$)/)?.[1] || "ar";
  const basePath = `/${locale}/dashboard`;
  const isRtl = locale === "ar";
  const isSuperAdmin = user.role === "super_admin";

  const handleSignOut = () => {
    signOut();
    router.push(`/${locale}`);
  };

  return (
    <div className={styles.container} dir={isRtl ? "rtl" : "ltr"}>
      <aside className={styles.sidebar}>
        <Link href={`/${locale}`} className={styles.brand}>
          <span className={styles.brandMark}>
            <Watch size={22} strokeWidth={1.8} />
          </span>
          <span className={styles.brandText}>
            <strong>Hourwright</strong>
            <small>Admin console</small>
          </span>
        </Link>

        <p className={styles.sectionLabel}>Workspace</p>

        <nav className={styles.nav} aria-label="Dashboard">
          <Link
            href={basePath}
            className={`${styles.navLink} ${pathname === basePath ? styles.navLinkActive : ""}`}
          >
            <span className={styles.navIcon}>
              <Home size={17} />
            </span>
            <span>Overview</span>
          </Link>
          <Link
            href={`${basePath}/orders`}
            className={`${styles.navLink} ${pathname.includes("/orders") ? styles.navLinkActive : ""}`}
          >
            <span className={styles.navIcon}>
              <ShoppingCart size={17} />
            </span>
            <span>Orders</span>
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <span className={styles.avatar}>{initials(user.username || user.email)}</span>
            <span className={styles.userMeta}>
              <strong>{user.username}</strong>
              <span>{user.email}</span>
            </span>
            <span className={styles.roleChip} title={isSuperAdmin ? "Super admin" : "Admin"}>
              <ShieldCheck size={13} />
              {isSuperAdmin ? "Super" : "Admin"}
            </span>
          </div>

          <div className={styles.footerActions}>
            <Link href={`/${locale}`} className={styles.backLink}>
              <Store size={15} />
              <span>Back to store</span>
            </Link>
            <button
              type="button"
              className={styles.signOut}
              onClick={handleSignOut}
              aria-label="Sign out"
            >
              <LogOut size={15} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}

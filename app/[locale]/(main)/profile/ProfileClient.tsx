"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  LifeBuoy,
  LogOut,
  Phone,
  ShieldCheck,
  Watch,
} from "lucide-react";
import { useAuth, type User } from "@/components/AuthProvider/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";
import LoyaltyCard from "@/components/LoyaltyCard/LoyaltyCard";
import styles from "./profile.module.css";

type ProfileCustomer = {
  id: number;
  phone: string;
  name: string | null;
  purchases: number;
  gifts_given: number;
  created_at: string;
};

type ConfirmState = {
  status: "idle" | "submitting" | "success" | "error";
  message?: string;
};

function initials(value: string): string {
  const parts = value.trim().split(/[\s._@-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function ProfileClient() {
  const { user, loading, signIn, signOut } = useAuth();
  const { language, t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const locale =
    (params?.locale as string) || (language === "AR" ? "ar" : language === "FR" ? "fr" : "en");

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<ProfileCustomer | null>(null);
  const [phone, setPhone] = useState("");
  const [confirmState, setConfirmState] = useState<ConfirmState>({ status: "idle" });

  const isStaff = user?.role === "admin" || user?.role === "super_admin";

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/${locale}/signin`);
      return;
    }
    if (isStaff) {
      router.replace(`/${locale}/dashboard`);
    }
  }, [loading, user, isStaff, router, locale]);

  // Re-read the account so links created by a recent order show up here too.
  useEffect(() => {
    if (!user || isStaff) return;

    let active = true;
    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch(`/api/profile?userId=${user.id}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;

        const data = await response.json();
        if (!active) return;

        if (data.user) {
          setProfileUser(data.user);
          signIn(data.user);
        }
        setCustomer(data.customer ?? null);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Could not refresh profile:", error);
        }
      }
    })();

    return () => {
      active = false;
      controller.abort();
    };
    // signIn is recreated by the provider; user.id is the meaningful dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isStaff]);

  if (loading || !user || isStaff) {
    return (
      <div className={styles.loading}>
        <LoadingSpinner size={32} text={t("profile.loading")} />
      </div>
    );
  }

  const currentUser = profileUser ?? user;
  const linked = currentUser.customer_id !== null && currentUser.customer_id !== undefined;
  const monogram = initials(currentUser.username || currentUser.email || "");

  const handleConfirmPhone = async (event: React.FormEvent) => {
    event.preventDefault();
    if (confirmState.status === "submitting") return;

    if (phone.replace(/\D/g, "").length < 6) {
      setConfirmState({ status: "error", message: t("profile.phoneInvalid") });
      return;
    }

    setConfirmState({ status: "submitting" });

    try {
      const response = await fetch("/api/profile/confirm-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, phone }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          data.code === "CUSTOMER_NOT_FOUND"
            ? t("profile.customerNotFound")
            : data.code === "LINKED_TO_OTHER"
              ? t("profile.linkedToOther")
              : t("profile.confirmError");
        setConfirmState({ status: "error", message });
        return;
      }

      setProfileUser(data.user);
      setCustomer(data.customer ?? null);
      signIn(data.user);
      setPhone("");
      setConfirmState({ status: "success", message: t("profile.phoneConfirmed") });
    } catch (error) {
      console.error("Phone confirmation error:", error);
      setConfirmState({ status: "error", message: t("profile.confirmError") });
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.avatar} aria-hidden="true">
          {monogram}
        </div>
        <div className={styles.identity}>
          <span className={styles.kicker}>{t("profile.clientAccount")}</span>
          <h1 className={styles.title}>{currentUser.username}</h1>
          <p className={styles.email}>{currentUser.email}</p>
        </div>
        <span className={styles.roleBadge}>
          <ShieldCheck size={13} aria-hidden="true" />
          {t("profile.client")}
        </span>
      </header>

      {!linked && (
        <section className={styles.confirmCard}>
          <span className={styles.confirmIcon} aria-hidden="true">
            <Phone size={20} />
          </span>
          <div className={styles.confirmBody}>
            <h2 className={styles.confirmTitle}>{t("profile.confirmPhoneTitle")}</h2>
            <p className={styles.confirmText}>{t("profile.confirmPhoneText")}</p>

            <form className={styles.confirmForm} onSubmit={handleConfirmPhone}>
              <label htmlFor="confirm-phone" className={styles.confirmLabel}>
                {t("profile.phoneLabel")}
              </label>
              <div className={styles.confirmRow}>
                <input
                  id="confirm-phone"
                  type="tel"
                  inputMode="tel"
                  dir="ltr"
                  className={styles.confirmInput}
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    if (confirmState.status === "error") {
                      setConfirmState({ status: "idle" });
                    }
                  }}
                  placeholder={t("profile.phonePlaceholder")}
                  autoComplete="tel"
                  disabled={confirmState.status === "submitting"}
                  required
                />
                <button
                  type="submit"
                  className={styles.confirmButton}
                  disabled={confirmState.status === "submitting" || phone.trim() === ""}
                >
                  {confirmState.status === "submitting"
                    ? t("profile.confirming")
                    : t("profile.confirmPhoneButton")}
                </button>
              </div>
            </form>

            {confirmState.status === "error" && confirmState.message && (
              <p className={styles.confirmError} role="alert">
                {confirmState.message}
              </p>
            )}
          </div>
        </section>
      )}

      {confirmState.status === "success" && confirmState.message && (
        <div className={styles.successAlert} role="status">
          <CheckCircle2 size={17} aria-hidden="true" />
          <span>{confirmState.message}</span>
        </div>
      )}

      <div className={styles.grid}>
        <div className={styles.loyalty}>
          <LoyaltyCard purchases={customer?.purchases ?? 0} />
        </div>

        <aside className={styles.side}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>
                <ShieldCheck size={18} />
              </span>
              <h2 className={styles.cardTitle}>{t("profile.clientAccount")}</h2>
            </div>

            {customer ? (
              <>
                <p className={styles.linkedLabel}>
                  <CheckCircle2 size={14} aria-hidden="true" />
                  {t("profile.linkedCustomer")}
                </p>
                <dl className={styles.customerDetails}>
                  <div>
                    <dt>{t("profile.customerName")}</dt>
                    <dd>{customer.name || t("profile.notProvided")}</dd>
                  </div>
                  <div>
                    <dt>{t("profile.customerPhone")}</dt>
                    <dd dir="ltr">{customer.phone || t("profile.notProvided")}</dd>
                  </div>
                  <div>
                    <dt>{t("loyalty.purchases")}</dt>
                    <dd>{customer.purchases ?? 0}</dd>
                  </div>
                </dl>
              </>
            ) : (
              <p className={styles.note}>{t("profile.accountNote")}</p>
            )}
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>
                <LifeBuoy size={18} />
              </span>
              <h2 className={styles.cardTitle}>{t("profile.quickLinks")}</h2>
            </div>

            <nav className={styles.links} aria-label={t("profile.quickLinks")}>
              <Link href={`/${locale}/watches`} className={styles.link}>
                <Watch size={16} aria-hidden="true" />
                <span>{t("profile.browseWatches")}</span>
              </Link>
              <Link href={`/${locale}/help`} className={styles.link}>
                <LifeBuoy size={16} aria-hidden="true" />
                <span>{t("profile.helpCenter")}</span>
              </Link>
              <button
                type="button"
                className={`${styles.link} ${styles.signOut}`}
                onClick={() => {
                  signOut();
                  router.push(`/${locale}`);
                }}
              >
                <LogOut size={16} aria-hidden="true" />
                <span>{t("profile.signOut")}</span>
              </button>
            </nav>
          </section>
        </aside>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import styles from "./auth.module.css";
import { useLanguage } from "@/components/LanguageProvider";

export default function SignInPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("auth.failedSignIn"));
      }

      // Store user in localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Redirect based on role
      if (data.user.role === "admin" || data.user.role === "super_admin") {
        router.push(`/${locale}`);
      } else {
        router.push(`/${locale}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t("auth.signIn")}</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>{t("auth.email")}</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>{t("auth.password")}</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? t("auth.signingIn") : t("auth.signIn")}
          </button>
        </form>
        <p className={styles.footer}>
          {t("auth.noAccount")}{" "}
          <Link href={`/${locale}/signup`} className={styles.link}>
            {t("auth.signUp")}
          </Link>
        </p>
      </div>
    </div>
  );
}

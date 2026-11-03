"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import styles from "./auth.module.css";
import { useLanguage } from "@/components/LanguageProvider";
import { useAuth } from "@/components/AuthProvider/AuthProvider";

export default function SignInPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const { t } = useLanguage();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
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

      // Update the shared auth context so the navbar switches immediately.
      signIn(data.user);

      router.push(`/${locale}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>{t("auth.signIn")}</h1>
          <p className={styles.subtitle}>{t("auth.signInSubtitle")}</p>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <motion.div
              className={styles.error}
              role="alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <AlertCircle size={16} aria-hidden="true" />
              <span>{error}</span>
            </motion.div>
          )}

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>{t("auth.email")}</label>
            <div className={styles.inputWrap}>
              <Mail size={16} className={styles.inputIcon} aria-hidden="true" />
              <input
                id="email"
                type="email"
                className={styles.input}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>{t("auth.password")}</label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} aria-hidden="true" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={`${styles.input} ${styles.hasToggle}`}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className={styles.toggle}
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            className={styles.button}
            disabled={loading}
            whileTap={loading ? undefined : { scale: 0.985 }}
          >
            {loading ? (
              <span className={styles.buttonContent}>
                <motion.span
                  className={styles.spinner}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 size={16} />
                </motion.span>
                {t("auth.signingIn")}
              </span>
            ) : (
              t("auth.signIn")
            )}
          </motion.button>
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

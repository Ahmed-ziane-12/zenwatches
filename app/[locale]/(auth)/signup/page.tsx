"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  X,
} from "lucide-react";
import styles from "../signin/auth.module.css";
import { useLanguage } from "@/components/LanguageProvider";
import { PASSWORD_CHECKS, isPasswordValid } from "@/lib/password";

export default function SignUpPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordChecks = PASSWORD_CHECKS.map((check) => ({
    ...check,
    met: check.test(formData.password),
  }));
  const strength = passwordChecks.filter((check) => check.met).length;
  const allMet = isPasswordValid(formData.password);
  const confirmTouched = formData.confirmPassword.length > 0;
  const passwordsMatch = formData.password === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!allMet) {
      setError(t("auth.pwRequirements"));
      return;
    }

    if (!passwordsMatch) {
      setError(t("auth.passwordsDontMatch"));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("auth.failedSignUp"));
      }

      router.push(`/${locale}/signin`);
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
          <h1 className={styles.title}>{t("auth.signUp")}</h1>
          <p className={styles.subtitle}>{t("auth.signUpSubtitle")}</p>
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
            <label htmlFor="username" className={styles.label}>{t("auth.username")}</label>
            <div className={styles.inputWrap}>
              <User size={16} className={styles.inputIcon} aria-hidden="true" />
              <input
                id="username"
                type="text"
                className={styles.input}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                autoComplete="username"
                placeholder="yourname"
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
                autoComplete="new-password"
                placeholder="••••••••"
                aria-describedby="password-requirements"
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

            <div className={styles.strength} aria-hidden="true">
              {passwordChecks.map((check, index) => (
                <span
                  key={check.key}
                  className={`${styles.strengthBar} ${index < strength ? styles.strengthOn : ""}`}
                />
              ))}
            </div>

            <ul id="password-requirements" className={styles.checklist} aria-live="polite">
              {passwordChecks.map((check) => (
                <li
                  key={check.key}
                  className={`${styles.condition} ${check.met ? styles.conditionMet : ""}`}
                >
                  {check.met ? <Check size={13} /> : <X size={13} />}
                  {t(check.key)}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword" className={styles.label}>
              {t("auth.confirmPassword")}
            </label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} aria-hidden="true" />
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                className={`${styles.input} ${styles.hasToggle}`}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                autoComplete="new-password"
                placeholder="••••••••"
                aria-describedby="confirm-password-status"
                aria-invalid={confirmTouched && !passwordsMatch}
                required
              />
              <button
                type="button"
                className={styles.toggle}
                onClick={() => setShowConfirm((visible) => !visible)}
                aria-label={showConfirm ? t("auth.hidePassword") : t("auth.showPassword")}
                aria-pressed={showConfirm}
              >
                {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {confirmTouched && (
              <span
                id="confirm-password-status"
                className={`${styles.matchHint} ${
                  passwordsMatch ? styles.matchHintOk : styles.matchHintBad
                }`}
              >
                {passwordsMatch ? <Check size={13} /> : <X size={13} />}
                {passwordsMatch ? t("auth.pwMatch") : t("auth.passwordsDontMatch")}
              </span>
            )}
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
                {t("auth.signingUp")}
              </span>
            ) : (
              t("auth.signUp")
            )}
          </motion.button>
        </form>

        <p className={styles.footer}>
          {t("auth.haveAccount")}{" "}
          <Link href={`/${locale}/signin`} className={styles.link}>
            {t("auth.signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}

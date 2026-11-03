"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function MakersPage() {
  const { t } = useLanguage();

  return (
    <main style={{ padding: "4rem 2rem", textAlign: "center" }}>
      <h1>{t("makers.title")}</h1>
      <p style={{ color: "var(--muted)" }}>{t("makers.comingSoon")}</p>
    </main>
  );
}

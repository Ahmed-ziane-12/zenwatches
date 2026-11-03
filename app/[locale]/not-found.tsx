"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";

export default function NotFound() {
  const { t } = useLanguage();
  const params = useParams();
  const locale = (params?.locale as string) || "ar";

  return (
    <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
      <h2>{t("notFound.title")}</h2>
      <p>{t("notFound.message")}</p>
      <Link href={`/${locale}`}>{t("notFound.home")}</Link>
    </div>
  );
}

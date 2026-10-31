"use client";

import LoyaltyCard from "@/components/LoyaltyCard/LoyaltyCard";
import { useLanguage } from "@/components/LanguageProvider";

export default function HomeClient() {
  const { t } = useLanguage();

  return (
    <div style={{ padding: "1rem 2.5rem", textAlign: "center" }}>
      <h2>{t("home.specialTreats")}</h2>
      <LoyaltyCard purchases={0} />
    </div>
  );
}

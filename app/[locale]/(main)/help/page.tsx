import type { Metadata } from "next";
import HelpCenter from "@/components/HelpCenter/HelpCenter";
import { translations, type Language } from "@/lib/translations";

function localeToLanguage(locale: string): Language {
  return locale === "en" ? "EN" : locale === "fr" ? "FR" : "AR";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = translations[localeToLanguage(locale)];

  return {
    title: t["meta.helpTitle"],
    description: t["meta.helpDescription"],
  };
}

export default function HelpPage() {
  return <HelpCenter />;
}

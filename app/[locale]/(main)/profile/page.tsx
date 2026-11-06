import type { Metadata } from "next";
import { translations, type Language } from "@/lib/translations";
import ProfileClient from "./ProfileClient";

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

  return { title: t["profile.title"] };
}

export default function ProfilePage() {
  return <ProfileClient />;
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "../../globals.css";
import { translations, type Language } from "@/lib/translations";

const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

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
    title: t["meta.authTitle"],
    description: t["meta.authDescription"],
  };
}

const locales = ["ar", "en", "fr"];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function AuthLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lang = locale === "en" ? "en" : locale === "fr" ? "fr" : "ar";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div lang={lang} dir={dir} className={`${body.variable} ${mono.variable}`} suppressHydrationWarning>
      {children}
    </div>
  );
}

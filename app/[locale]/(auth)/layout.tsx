import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { PackageCheck, ShieldCheck, Zap } from "lucide-react";
import "../../globals.css";
import { translations, type Language } from "@/lib/translations";
import styles from "./auth-layout.module.css";

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
  const t = translations[localeToLanguage(locale)];

  const perks = [
    { icon: PackageCheck, label: t["auth.perkOrders"] },
    { icon: Zap, label: t["auth.perkFaster"] },
    { icon: ShieldCheck, label: t["auth.perkSecure"] },
  ];

  return (
    <div
      lang={lang}
      dir={dir}
      className={`${body.variable} ${mono.variable} ${styles.shell}`}
      suppressHydrationWarning
    >
      <aside className={styles.aside}>
        <Link href={`/${locale}`} className={styles.brand}>
          <Image src="/images/logo.jpg" alt="" width={46} height={46} className={styles.logo} />
          <span className={styles.brandName}>Zen Watches</span>
        </Link>

        <div className={styles.asideCopy}>
          <h2 className={styles.asideTitle}>{t["auth.sideTitle"]}</h2>
          <p className={styles.asideText}>{t["auth.sideText"]}</p>
        </div>

        <ul className={styles.perks}>
          {perks.map((perk) => {
            const Icon = perk.icon;
            return (
              <li key={perk.label} className={styles.perk}>
                <span className={styles.perkIcon}>
                  <Icon size={16} aria-hidden="true" />
                </span>
                <span>{perk.label}</span>
              </li>
            );
          })}
        </ul>
      </aside>

      <main className={styles.main}>
        <div className={styles.mainInner}>
          <Link href={`/${locale}`} className={styles.mobileBrand}>
            <Image src="/images/logo.jpg" alt="" width={36} height={36} className={styles.logo} />
            <span>Zen Watches</span>
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}

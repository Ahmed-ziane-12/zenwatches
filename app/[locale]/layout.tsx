import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "../globals.css";
import { CartProvider } from "@/components/CartProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { AuthProvider } from "@/components/AuthProvider/AuthProvider";
import WatchSprite from "@/components/WatchSprite";
import CartDrawer from "@/components/CartDrawer/CartDrawer";
import MetaPixel from "@/components/MetaPixel";
import CookieConsent from "@/components/CookieConsent/CookieConsent";
import { translations, type Language } from "@/lib/translations";

const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });
const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || "Zen Watches";

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
    title: { default: `${STORE_NAME} | ${t["meta.tagline"]}`, template: `%s | ${STORE_NAME}` },
    description: t["meta.description"],
    icons: {
      icon: "/icon.svg",
    },
  };
}

const locales = ["ar", "en", "fr"];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const lang = locale === "en" ? "en" : locale === "fr" ? "fr" : "ar";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir} className={`${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Apply the saved theme before the first paint so full page loads keep the chosen theme. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();",
          }}
        />
      </head>
      <body>
        <LanguageProvider locale={locale}>
          <AuthProvider>
            <CartProvider>
              <WatchSprite />
              {children}
              <CartDrawer />
              <MetaPixel />
              <CookieConsent />
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

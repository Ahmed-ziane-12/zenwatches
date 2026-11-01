import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "../globals.css";
import { CartProvider } from "@/components/CartProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import WatchSprite from "@/components/WatchSprite";
import Navbar from "@/components/Navbar/Navbar";
import CartDrawer from "@/components/CartDrawer/CartDrawer";
import Footer from "@/components/Footer/Footer";

const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Hourwright",
  description: "Automatic, hand-wound and quartz watches from independent makers.",
};

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
      <body>
        <LanguageProvider locale={locale}>
          <CartProvider>
            <WatchSprite />
            <Navbar />
            {children}
            <Footer />
            <CartDrawer />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

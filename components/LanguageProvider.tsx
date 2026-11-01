"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { translations, type Language } from "@/lib/translations";

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof (typeof translations)[Language], params?: Record<string, string | number>) => string;
  dir: "rtl" | "ltr";
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const localeToLang: Record<string, Language> = {
  ar: "AR",
  en: "EN",
  fr: "FR",
};

export function LanguageProvider({ children, locale }: { children: ReactNode; locale?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const initialLang = locale ? (localeToLang[locale] || "AR") : "AR";
  const [language, setLanguageState] = useState<Language>(initialLang);

  const setLanguage = (lang: Language) => {
    const segments = pathname.split("/").filter(Boolean);
    const newLocale = lang === "AR" ? "ar" : lang === "EN" ? "en" : "fr";
    
    if (segments[0] === "ar" || segments[0] === "en" || segments[0] === "fr") {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }
    router.push("/" + segments.join("/"));
    setLanguageState(lang);
  };

  const t = (key: keyof (typeof translations)[Language], params?: Record<string, string | number>) => {
    let text = translations[language][key] as string;
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(`{${paramKey}}`, String(value));
      });
    }
    return text;
  };

  const dir = language === "AR" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

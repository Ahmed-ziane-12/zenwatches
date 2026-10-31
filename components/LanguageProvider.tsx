"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_LANGUAGE, translations, type Language } from "@/lib/translations";

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof (typeof translations)[Language], params?: Record<string, string | number>) => string;
  dir: "rtl" | "ltr";
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("language");
      if (saved === "AR" || saved === "EN" || saved === "FR") {
        setLanguageState(saved);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("language", language);
    } catch (e) {
      // ignore
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = language.toLowerCase();
      document.documentElement.dir = language === "AR" ? "rtl" : "ltr";
    }
  }, [language, mounted]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const currentLang = mounted ? language : DEFAULT_LANGUAGE;

  const t = (key: keyof (typeof translations)[Language], params?: Record<string, string | number>) => {
    let text = translations[currentLang][key] as string;
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(`{${paramKey}}`, String(value));
      });
    }
    return text;
  };

  const dir = currentLang === "AR" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ language: currentLang, setLanguage: setLanguageState, t, dir }}>
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

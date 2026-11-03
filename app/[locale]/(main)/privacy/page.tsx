import type { Metadata } from "next";
import { Cookie, Database, Mail, Megaphone, Settings2, ShieldCheck } from "lucide-react";
import { translations, type Language } from "@/lib/translations";
import styles from "./privacy.module.css";

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
    title: t["privacy.title"],
    description: t["privacy.intro"],
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = translations[localeToLanguage(locale)];

  const sections = [
    {
      icon: Database,
      title: t["privacy.dataTitle"],
      body: t["privacy.dataBody"],
    },
    {
      icon: Cookie,
      title: t["privacy.cookiesTitle"],
      body: t["privacy.cookiesBody"],
    },
    {
      icon: Megaphone,
      title: t["privacy.adsTitle"],
      body: t["privacy.adsBody"],
    },
    {
      icon: Settings2,
      title: t["privacy.rightsTitle"],
      body: t["privacy.rightsBody"],
    },
    {
      icon: Mail,
      title: t["privacy.contactTitle"],
      body: t["privacy.contactBody"],
    },
  ];

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <span className={styles.icon}>
          <ShieldCheck size={24} />
        </span>
        <div>
          <h1 className={styles.title}>{t["privacy.title"]}</h1>
          <p className={styles.updated}>{t["privacy.updated"]}</p>
        </div>
      </header>

      <p className={styles.intro}>{t["privacy.intro"]}</p>

      <div className={styles.sections}>
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <section key={section.title} className={styles.section}>
              <span className={styles.sectionIcon}>
                <Icon size={18} />
              </span>
              <div>
                <h2 className={styles.sectionTitle}>{section.title}</h2>
                <p className={styles.sectionBody}>{section.body}</p>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

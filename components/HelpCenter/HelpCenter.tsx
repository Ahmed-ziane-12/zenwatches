"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Truck, RefreshCcw, Ruler, HelpCircle, ChevronDown, ChevronRight } from "lucide-react";
import styles from "./HelpCenter.module.css";
import { useLanguage } from "@/components/LanguageProvider";

const SECTIONS = [
  { id: "about", titleKey: "help.section.about", icon: BookOpen },
  { id: "shipping", titleKey: "help.section.shipping", icon: Truck },
  { id: "returns", titleKey: "help.section.returns", icon: RefreshCcw },
  { id: "size", titleKey: "help.section.size", icon: Ruler },
  { id: "faq", titleKey: "help.section.faq", icon: HelpCircle },
] as const;

const FAQS = [
  { questionKey: "help.faq.q1", answerKey: "help.faq.a1" },
  { questionKey: "help.faq.q2", answerKey: "help.faq.a2" },
  { questionKey: "help.faq.q3", answerKey: "help.faq.a3" },
  { questionKey: "help.faq.q4", answerKey: "help.faq.a4" },
  { questionKey: "help.faq.q5", answerKey: "help.faq.a5" },
] as const;

export default function HelpCenter() {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState("about");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTitle}>
          <BookOpen size={18} />
          <span>{t("nav.help")}</span>
        </div>
        <nav className={styles.nav}>
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`${styles.navLink} ${activeSection === section.id ? styles.navLinkActive : ""}`}
              >
                <Icon size={16} />
                <span>{t(section.titleKey as any)}</span>
                <ChevronRight size={14} style={{ marginLeft: "auto" }} />
              </button>
            );
          })}
        </nav>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>{t("nav.help")}</h1>
          <p className={styles.headerSubtitle}>{t("help.subtitle")}</p>
        </header>

        <motion.section
          id="about"
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className={styles.sectionHeader}>
            <BookOpen size={24} />
            <h2 className={styles.sectionTitle}>{t("help.section.about")}</h2>
          </div>
          <div className={styles.sectionContent}>
            <p>{t("help.about.p1")}</p>
            <p>{t("help.about.p2")}</p>
          </div>
        </motion.section>

        <motion.section
          id="shipping"
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className={styles.sectionHeader}>
            <Truck size={24} />
            <h2 className={styles.sectionTitle}>{t("help.section.shipping")}</h2>
          </div>
          <div className={styles.sectionContent}>
            <ul className={styles.list}>
              <li className={styles.listItem}>{t("help.shipping.item1")}</li>
              <li className={styles.listItem}>{t("help.shipping.item2")}</li>
              <li className={styles.listItem}>{t("help.shipping.item3")}</li>
              <li className={styles.listItem}>{t("help.shipping.item4")}</li>
            </ul>
          </div>
        </motion.section>

        <motion.section
          id="returns"
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className={styles.sectionHeader}>
            <RefreshCcw size={24} />
            <h2 className={styles.sectionTitle}>{t("help.section.returns")}</h2>
          </div>
          <div className={styles.sectionContent}>
            <ul className={styles.list}>
              <li className={styles.listItem}>{t("help.returns.item1")}</li>
              <li className={styles.listItem}>{t("help.returns.item2")}</li>
              <li className={styles.listItem}>{t("help.returns.item3")}</li>
            </ul>
          </div>
        </motion.section>

        <motion.section
          id="size"
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className={styles.sectionHeader}>
            <Ruler size={24} />
            <h2 className={styles.sectionTitle}>{t("help.section.size")}</h2>
          </div>
          <div className={styles.sectionContent}>
            <p>{t("help.size.intro")}</p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t("help.size.wrist")}</th>
                    <th>{t("help.size.case")}</th>
                    <th>{t("help.size.wears")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{t("help.size.r1a")}</td>
                    <td>{t("help.size.r1b")}</td>
                    <td>{t("help.size.r1c")}</td>
                  </tr>
                  <tr>
                    <td>{t("help.size.r2a")}</td>
                    <td>{t("help.size.r2b")}</td>
                    <td>{t("help.size.r2c")}</td>
                  </tr>
                  <tr>
                    <td>{t("help.size.r3a")}</td>
                    <td>{t("help.size.r3b")}</td>
                    <td>{t("help.size.r3c")}</td>
                  </tr>
                  <tr>
                    <td>{t("help.size.r4a")}</td>
                    <td>{t("help.size.r4b")}</td>
                    <td>{t("help.size.r4c")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.section>

        <motion.section
          id="faq"
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className={styles.sectionHeader}>
            <HelpCircle size={24} />
            <h2 className={styles.sectionTitle}>{t("help.section.faq")}</h2>
          </div>
          <div className={styles.accordion}>
            {FAQS.map((faq, index) => (
              <div key={index} className={styles.accordionItem}>
                <button
                  className={styles.accordionButton}
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  aria-expanded={openFaq === index}
                >
                  <span>{t(faq.questionKey as any)}</span>
                  <motion.div animate={{ rotate: openFaq === index ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={18} />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className={styles.accordionContent}>{t(faq.answerKey as any)}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Truck, RefreshCcw, Ruler, HelpCircle, ChevronDown, ChevronRight } from "lucide-react";
import styles from "./HelpCenter.module.css";

const SECTIONS = [
  { id: "about", title: "About Us", icon: BookOpen },
  { id: "shipping", title: "Shipping Info", icon: Truck },
  { id: "returns", title: "Returns & Exchanges", icon: RefreshCcw },
  { id: "size", title: "Size Guide", icon: Ruler },
  { id: "faq", title: "FAQ", icon: HelpCircle },
];

const FAQS = [
  { question: "Question 1", answer: "This is a placeholder answer. Edit this later with your actual information." },
  { question: "Question 2", answer: "This is a placeholder answer. Edit this later with your actual information." },
  { question: "Question 3", answer: "This is a placeholder answer. Edit this later with your actual information." },
  { question: "Question 4", answer: "This is a placeholder answer. Edit this later with your actual information." },
  { question: "Question 5", answer: "This is a placeholder answer. Edit this later with your actual information." },
];

export default function HelpCenter() {
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
          <span>Help Center</span>
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
                <span>{section.title}</span>
                <ChevronRight size={14} style={{ marginLeft: "auto" }} />
              </button>
            );
          })}
        </nav>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>Help Center</h1>
          <p className={styles.headerSubtitle}>Everything you need to know about shopping with Hourwright</p>
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
            <h2 className={styles.sectionTitle}>About Us</h2>
          </div>
          <div className={styles.sectionContent}>
            <p>
              Hourwright is your destination for carefully curated automatic, hand-wound and quartz watches from independent
              makers. We believe in craftsmanship, timeless design, and honest service.
            </p>
            <p>
              Our team sources pieces with character and provenance, backs them with clear policies, and helps you find a
              watch you'll keep for years to come.
            </p>
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
            <h2 className={styles.sectionTitle}>Shipping Info</h2>
          </div>
          <div className={styles.sectionContent}>
            <ul className={styles.list}>
              <li className={styles.listItem}>Orders are delivered within 1–2 working days.</li>
              <li className={styles.listItem}>You will get a confirmation call once your order is placed then when your order ships.</li>
              <li className={styles.listItem}>
                Delivery is free above the threshold shown in your cart; a flat fee applies below it.
              </li>
              <li className={styles.listItem}>Every parcel is insured and requires a signature on delivery.</li>
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
            <h2 className={styles.sectionTitle}>Returns & Exchanges</h2>
          </div>
          <div className={styles.sectionContent}>
            <ul className={styles.list}>
              <li className={styles.listItem}>You have the right to check your watch before paying.</li>
              <li className={styles.listItem}>
                You can return or exchange any undamaged watch only on the stop-desk or to the delivery man, any shipment
                that reaches your house is not exchangeable.
              </li>
              <li className={styles.listItem}>
                Watches must come back in original condition, with protective films, tags, box and papers.
              </li>
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
            <h2 className={styles.sectionTitle}>Size Guide</h2>
          </div>
          <div className={styles.sectionContent}>
            <p>
              Case diameter is the quickest way to judge how a watch will wear. Measure your wrist just below the wrist bone
              and use the table as a starting point.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Wrist size</th>
                    <th>Suggested case</th>
                    <th>Wears as</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Under 15 cm</td>
                    <td>28 – 36 mm</td>
                    <td>Small / classic</td>
                  </tr>
                  <tr>
                    <td>15 – 17 cm</td>
                    <td>36 – 40 mm</td>
                    <td>Medium</td>
                  </tr>
                  <tr>
                    <td>17 – 19 cm</td>
                    <td>40 – 44 mm</td>
                    <td>Large / sport</td>
                  </tr>
                  <tr>
                    <td>Over 19 cm</td>
                    <td>44 mm and up</td>
                    <td>Oversized</td>
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
            <h2 className={styles.sectionTitle}>FAQ</h2>
          </div>
          <div className={styles.accordion}>
            {FAQS.map((faq, index) => (
              <div key={index} className={styles.accordionItem}>
                <button
                  className={styles.accordionButton}
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  aria-expanded={openFaq === index}
                >
                  <span>{faq.question}</span>
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
                      <div className={styles.accordionContent}>{faq.answer}</div>
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

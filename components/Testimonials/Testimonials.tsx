"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import styles from "./Testimonials.module.css";
import { useLanguage } from "@/components/LanguageProvider";

type Review = {
  name: string;
  place: string;
  avatar: string;
  textKey: string;
};

// Sample reviews: replace with real customer feedback before launch.
const REVIEWS: Review[] = [
  {
    name: "James Carter",
    place: "USA",
    avatar: "/tst1.avif",
    textKey: "testimonials.text1",
  },
  {
    name: "Emily Roberts",
    place: "UK",
    avatar: "/tst2.avif",
    textKey: "testimonials.text2",
  },
  {
    name: "Ahmed Khan",
    place: "UAE",
    avatar: "/tst3.avif",
    textKey: "testimonials.text3",
  },
  {
    name: "Sofia Martinez",
    place: "Spain",
    avatar: "",
    textKey: "testimonials.text4",
  },
];

const CONTROLS = [
  { dir: -1, Icon: ChevronLeft, labelKey: "testimonials.prev" },
  { dir: 1, Icon: ChevronRight, labelKey: "testimonials.next" },
] as const;

export default function Testimonials() {
  const trackRef = useRef<HTMLUListElement>(null);
  const { t } = useLanguage();

  const scroll = (dir: -1 | 1) => {
    const el = trackRef.current;
    const card = el?.firstElementChild as HTMLElement | null | undefined;
    if (el && card) {
      el.scrollBy({ left: dir * (card.offsetWidth + 20), behavior: "smooth" });
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{t("testimonials.title")}</h2>
          <p className={styles.subtitle}>{t("testimonials.subtitle")}</p>
        </div>
        <div className={styles.controls}>
          {CONTROLS.map(({ dir, Icon, labelKey }) => (
            <button
              key={dir}
              type="button"
              onClick={() => scroll(dir)}
              aria-label={t(labelKey as any)}
              className={styles.controlBtn}
            >
              <Icon size={17} />
            </button>
          ))}
        </div>
      </div>

      <ul ref={trackRef} className={styles.track}>
        {REVIEWS.map((r) => (
          <li key={r.name} className={styles.card}>
            <div className={styles.stars} role="img" aria-label="Rated 5 out of 5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} size={14} className={styles.star} />
              ))}
            </div>
            <p className={styles.text}>{t(r.textKey as any)}</p>
            <div className={styles.author}>
              {r.avatar ? (
                <img src={r.avatar} alt="" loading="lazy" className={styles.avatar} />
              ) : (
                <span className={styles.avatarFallback}>{r.name.charAt(0)}</span>
              )}
              <p className={styles.name}>
                {r.name}
                <span className={styles.place}>{r.place}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
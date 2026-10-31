"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import styles from "./Testimonials.module.css";

type Review = {
  name: string;
  place: string;
  avatar: string;
  text: string;
};

// Sample reviews: replace with real customer feedback before launch.
const REVIEWS: Review[] = [
  {
    name: "James Carter",
    place: "USA",
    avatar: "/tst1.avif",
    text: "Amazing quality and fast delivery! The watch is even more beautiful in person. Highly recommend WatchShop.com.",
  },
  {
    name: "Emily Roberts",
    place: "UK",
    avatar: "/tst2.avif",
    text: "Authentic products and excellent customer service. I've bought 3 watches already and every time it's been perfect!",
  },
  {
    name: "Ahmed Khan",
    place: "UAE",
    avatar: "/tst3.avif",
    text: "Great prices and a smooth shopping experience. Will definitely shop again!",
  },
  {
    name: "Sofia Martinez",
    place: "Spain",
    avatar: "",
    text: "My Seiko arrived beautifully packed with the box and papers. Exactly as described and a fair price.",
  },
];

const CONTROLS = [
  { dir: -1, Icon: ChevronLeft, label: "Previous reviews" },
  { dir: 1, Icon: ChevronRight, label: "Next reviews" },
] as const;

export default function Testimonials() {
  const trackRef = useRef<HTMLUListElement>(null);

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
          <h2 className={styles.title}>What Our Customers Say</h2>
          <p className={styles.subtitle}>Real stories from real watch lovers.</p>
        </div>
        <div className={styles.controls}>
          {CONTROLS.map(({ dir, Icon, label }) => (
            <button
              key={dir}
              type="button"
              onClick={() => scroll(dir)}
              aria-label={label}
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
            <p className={styles.text}>{r.text}</p>
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
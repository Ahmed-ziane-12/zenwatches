"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import styles from "./Testimonials.module.css";
import { useLanguage } from "@/components/LanguageProvider";

type TestimonialTag =
  | "testimonials.tag.thankYou"
  | "testimonials.tag.delivery"
  | "testimonials.tag.wrist"
  | "testimonials.tag.gift"
  | "testimonials.tag.voice";

type Testimonial = {
  src: string;
  tagKey: TestimonialTag;
  /** Focus point for the cropped preview; the lightbox always shows the whole image. */
  position: string;
};

/**
 * Real client conversations. The files live in /public/testimonials.
 * The order below is intentional: the strongest message is the hero.
 */
const TESTIMONIALS: Testimonial[] = [
  {
    src: "/testimonials/IMG_20261106_182130_406.jpg",
    tagKey: "testimonials.tag.thankYou",
    position: "50% 40%",
  },
  {
    src: "/testimonials/IMG_20261106_182129_999.jpg",
    tagKey: "testimonials.tag.wrist",
    position: "50% 45%",
  },
  {
    src: "/testimonials/IMG_20261106_182130_368.jpg",
    tagKey: "testimonials.tag.gift",
    position: "50% 40%",
  },
  {
    src: "/testimonials/IMG_20261106_182130_474.jpg",
    tagKey: "testimonials.tag.delivery",
    position: "50% 40%",
  },
  {
    src: "/testimonials/IMG_20261106_182129_817.jpg",
    tagKey: "testimonials.tag.delivery",
    position: "50% 0%",
  },
  {
    src: "/testimonials/IMG_20261106_182130_298.jpg",
    tagKey: "testimonials.tag.voice",
    position: "50% 40%",
  },
  {
    src: "/testimonials/IMG_20261106_182129_808.jpg",
    tagKey: "testimonials.tag.voice",
    position: "50% 0%",
  },
];

const TOTAL = TESTIMONIALS.length;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export default function Testimonials() {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);

  const closeRef = useRef<HTMLButtonElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const current = TESTIMONIALS[active];
  const lightboxItem = lightbox === null ? null : TESTIMONIALS[lightbox];
  const isLightboxOpen = lightbox !== null;

  const others = TESTIMONIALS.map((item, index) => ({ item, index })).filter(
    ({ index }) => index !== active,
  );

  const step = (delta: number) => {
    setActive((index) => (index + delta + TOTAL) % TOTAL);
  };

  const openLightbox = (index: number) => {
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    setZoomed(false);
    setLightbox(index);
  };

  const closeLightbox = useCallback(() => {
    setLightbox(null);
    setZoomed(false);
  }, []);

  const stepLightbox = useCallback((delta: number) => {
    setLightbox((index) =>
      index === null ? index : (index + delta + TOTAL) % TOTAL,
    );
    setZoomed(false);
  }, []);

  const selectThumb = (index: number) => {
    setActive(index);
    if (window.matchMedia("(max-width: 960px)").matches) {
      featuredRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Keyboard navigation for the full-screen view.
  useEffect(() => {
    if (!isLightboxOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        stepLightbox(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepLightbox(-1);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isLightboxOpen, closeLightbox, stepLightbox]);

  // Lock the page and move focus while the dialog is open, then restore it.
  useEffect(() => {
    if (!isLightboxOpen) {
      lastFocusedRef.current?.focus();
      lastFocusedRef.current = null;
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isLightboxOpen]);

  return (
    <section className={styles.section} aria-labelledby="testimonials-title">
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <span className={styles.eyebrow}>
              <BadgeCheck size={14} aria-hidden="true" />
              {t("testimonials.eyebrow")}
            </span>
            <h2 id="testimonials-title" className={styles.title}>
              {t("testimonials.title")}
            </h2>
            <p className={styles.subtitle}>{t("testimonials.subtitle")}</p>
          </div>

          <div className={styles.headerAside}>
            <span className={styles.counter} dir="ltr">
              {pad(active + 1)} / {pad(TOTAL)}
            </span>
            <div className={styles.controls}>
              <button
                type="button"
                className={styles.controlBtn}
                onClick={() => step(-1)}
                aria-label={t("testimonials.prev")}
              >
                <ChevronLeft size={17} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={styles.controlBtn}
                onClick={() => step(1)}
                aria-label={t("testimonials.next")}
              >
                <ChevronRight size={17} aria-hidden="true" />
              </button>
            </div>
          </div>
        </header>

        <div className={styles.gallery}>
          <div ref={featuredRef} className={styles.featuredWrap}>
            <article className={styles.featured}>
              <button
                type="button"
                className={styles.featuredMedia}
                onClick={() => openLightbox(active)}
                aria-label={`${t("testimonials.viewFull")}: ${t(current.tagKey)}`}
              >
                <Image
                  key={current.src}
                  src={current.src}
                  alt={`${t("testimonials.verified")} — ${t(current.tagKey)}`}
                  fill
                  quality={90}
                  sizes="(max-width: 960px) 92vw, 620px"
                  className={styles.featuredImage}
                  style={{ objectPosition: current.position }}
                />
                <span className={styles.expand}>
                  <Maximize2 size={15} aria-hidden="true" />
                  {t("testimonials.viewFull")}
                </span>
              </button>

              <div className={styles.caption}>
                <div className={styles.captionMain}>
                  <span className={styles.verified}>
                    <BadgeCheck size={16} aria-hidden="true" />
                    {t("testimonials.verified")}
                  </span>
                  <span className={styles.tag}>{t(current.tagKey)}</span>
                </div>
                <span className={styles.received}>{t("testimonials.received")}</span>
              </div>
            </article>
          </div>

          <div className={styles.thumbs} aria-label={t("testimonials.title")}>
            {others.map(({ item, index }) => (
              <button
                key={item.src}
                type="button"
                className={styles.thumb}
                onClick={() => selectThumb(index)}
                aria-label={`${t("testimonials.openMessage", { n: index + 1 })}: ${t(item.tagKey)}`}
              >
                <Image
                  src={item.src}
                  alt=""
                  fill
                  quality={75}
                  sizes="(max-width: 960px) 30vw, 240px"
                  className={styles.thumbImage}
                  style={{ objectPosition: item.position }}
                />
                <span className={styles.thumbIndex} dir="ltr">
                  {pad(index + 1)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <p className={styles.note}>
          <Check size={14} aria-hidden="true" />
          {t("testimonials.note")}
        </p>
      </div>

      {lightbox !== null &&
        lightboxItem &&
        createPortal(
          <div
            className={styles.lightbox}
            role="dialog"
            aria-modal="true"
            aria-label={t("testimonials.title")}
            onClick={closeLightbox}
          >
            <div
              className={styles.lightboxPanel}
              onClick={(event) => event.stopPropagation()}
            >
              <div className={styles.lightboxBar}>
                <span className={styles.lightboxCount} dir="ltr">
                  {pad(lightbox + 1)} / {pad(TOTAL)}
                </span>
                <div className={styles.lightboxActions}>
                  <button
                    type="button"
                    className={styles.lightboxAction}
                    onClick={() => setZoomed((value) => !value)}
                    aria-label={zoomed ? t("testimonials.zoomOut") : t("testimonials.zoomIn")}
                    aria-pressed={zoomed}
                  >
                    {zoomed ? (
                      <ZoomOut size={18} aria-hidden="true" />
                    ) : (
                      <ZoomIn size={18} aria-hidden="true" />
                    )}
                  </button>
                  <button
                    ref={closeRef}
                    type="button"
                    className={styles.lightboxAction}
                    onClick={closeLightbox}
                    aria-label={t("testimonials.close")}
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className={`${styles.stage} ${zoomed ? styles.stageZoomed : ""}`}>
                <Image
                  key={lightboxItem.src}
                  src={lightboxItem.src}
                  alt={`${t("testimonials.verified")} — ${t(lightboxItem.tagKey)}`}
                  width={1170}
                  height={2080}
                  quality={90}
                  sizes="(max-width: 900px) 100vw, 1100px"
                  className={styles.lightboxImage}
                  priority
                />
              </div>

              <button
                type="button"
                className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
                onClick={() => stepLightbox(-1)}
                aria-label={t("testimonials.prev")}
              >
                <ChevronLeft size={22} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`${styles.lightboxNav} ${styles.lightboxNext}`}
                onClick={() => stepLightbox(1)}
                aria-label={t("testimonials.next")}
              >
                <ChevronRight size={22} aria-hidden="true" />
              </button>

              <div className={styles.lightboxCaption}>
                <span className={styles.verified}>
                  <BadgeCheck size={15} aria-hidden="true" />
                  {t("testimonials.verified")}
                </span>
                <span className={styles.tag}>{t(lightboxItem.tagKey)}</span>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}

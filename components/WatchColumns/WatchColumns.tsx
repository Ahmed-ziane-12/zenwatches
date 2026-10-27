"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { COLUMN_MOTION, formatPrice, type Product } from "@/lib/products";
import { useCart } from "../CartProvider";
import ProductImage from "../ProductImage/ProductImage";
import styles from "./WatchColumns.module.css";

function Tile({ product, clone = false }: { product: Product; clone?: boolean }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function onAdd() {
    add(product);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1400);
  }

  const label = `${product.name}${product.colorLabel ? `, ${product.colorLabel}` : ""}`;

  return (
    // The second copy of each column only exists to make the loop seamless, so it is hidden from assistive tech.
    <figure className={`${styles.tile} ${clone ? styles.clone : ""}`} aria-hidden={clone || undefined}>
      <ProductImage
        product={product}
        labelled={!clone}
        className={styles.art}
        sizes="(max-width: 560px) 100%, 200px"
      />
      <figcaption className={styles.caption}>
        <div className={styles.info}>
          <span className={styles.name}>{product.name}</span>
          <span className={styles.spec}>{product.spec}</span>
        </div>
        <div className={styles.buy}>
          <span className={styles.price}>{formatPrice(product.price, product.currency)}</span>
          <button
            type="button"
            className={`${styles.add} ${added ? styles.added : ""}`}
            onClick={onAdd}
            tabIndex={clone ? -1 : undefined}
            aria-label={`Add ${label} to bag`}
          >
            {added ? "Added" : "Add"}
          </button>
        </div>
      </figcaption>
    </figure>
  );
}

// `columns` comes from the server page: three lists of watches picked at random from the database.
export default function WatchColumns({ columns }: { columns: Product[][] }) {
  const [paused, setPaused] = useState(false);

  return (
    <section className={`${styles.stage} ${paused ? styles.paused : ""}`} aria-label="Featured watches">
      <div className={styles.visual}>
        {columns.map((products, i) => {
          const motion = COLUMN_MOTION[i % COLUMN_MOTION.length];
          return (
            <div
              key={i}
              className={`${styles.col} ${motion.dir === "down" ? styles.down : styles.up}`}
              style={{ "--dur": `${motion.dur}s`, "--delay": `${motion.delay}s` } as CSSProperties}
            >
              <div className={styles.track}>
                {/* Index in the key: a short catalogue can repeat a watch within one column. */}
                {products.map((p, n) => (
                  <Tile key={`${p.id}-${n}`} product={p} />
                ))}
                {products.map((p, n) => (
                  <Tile key={`${p.id}-${n}-clone`} product={p} clone />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.pause}
          aria-pressed={paused}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? "Play motion" : "Pause motion"}
        </button>
      </div>
    </section>
  );
}

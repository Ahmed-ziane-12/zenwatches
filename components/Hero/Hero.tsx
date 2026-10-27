import type { Product } from "@/lib/products";
import WatchColumns from "../WatchColumns/WatchColumns";
import styles from "./Hero.module.css";

export default function Hero({ columns }: { columns: Product[][] }) {
  // With no watches to show (database empty or unreachable) the copy takes the full width.
  const hasWatches = columns.length > 0;

  return (
    <main className={styles.wrap}>
      <div className={`${styles.hero} ${hasWatches ? "" : styles.solo}`}>
        <section>
          <p className={styles.eyebrow}>Delivery to all 69 wilayas</p>
          <h1 className={styles.title}>
            Find your next watch <span className={styles.time}>for less.</span>.
          </h1>
          <p className={styles.lede}>
            Browse the collection, pick your watch and order in a few minutes.
          </p>
          <div className={styles.actions}>
            <a className={styles.btn} href="#">Shop watches</a>
            <a className={styles.textLink} href="#">Find your wrist size</a>
          </div>
          <ul className={styles.facts}>
            <li>Cash on delivery</li>
            <li>Delivery across Algeria</li>
            <li>Order in 2 minutes</li>
          </ul>
        </section>

        {hasWatches && <WatchColumns columns={columns} />}
      </div>
    </main>
  );
}

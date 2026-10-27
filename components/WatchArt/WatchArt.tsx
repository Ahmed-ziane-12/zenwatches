import type { CSSProperties } from "react";
import { COLORWAYS, type ColorwayId, type ModelId } from "@/lib/products";
import styles from "./WatchArt.module.css";

// Draws one watch from the shared sprite. Pass `label` to expose it to screen readers.
interface WatchArtProps {
  model: ModelId;
  cw: ColorwayId;
  label?: string;
  className?: string;
}

export default function WatchArt({ model, cw, label, className = "" }: WatchArtProps) {
  const c = COLORWAYS[cw];
  const vars = {
    "--case": c.case,
    "--bezel": c.bezel,
    "--dial": c.dial,
    "--strap": c.strap,
    "--mark": c.mark,
    "--acc": c.acc,
  };
  return (
    <svg
      className={`${styles.svg} ${className}`}
      viewBox="0 0 200 260"
      style={vars as CSSProperties}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <use href={`#w-${model}`} width="200" height="260" />
    </svg>
  );
}

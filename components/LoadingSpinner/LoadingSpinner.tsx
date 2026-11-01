"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import styles from "./LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
}

export default function LoadingSpinner({ size = 24, text }: LoadingSpinnerProps) {
  return (
    <div className={styles.container}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 size={size} className={styles.spinner} />
      </motion.div>
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
}

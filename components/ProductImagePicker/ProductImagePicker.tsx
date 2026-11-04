"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ImagePlus, UploadCloud, X } from "lucide-react";
import { MAX_IMAGE_BYTES, MAX_PRODUCT_IMAGES } from "@/lib/product-admin";
import styles from "./ProductImagePicker.module.css";

type ProductImagePickerProps = {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
  max?: number;
};

function fileKey(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

/**
 * Stages images locally (with previews) before a product exists. The parent uploads
 * them once the product record has been created.
 */
export default function ProductImagePicker({
  files,
  onChange,
  disabled = false,
  max = MAX_PRODUCT_IMAGES,
}: ProductImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Array<{ file: File; url: string }>>([]);

  useEffect(() => {
    const next = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPreviews(next);
    return () => {
      for (const preview of next) URL.revokeObjectURL(preview.url);
    };
  }, [files]);

  const remaining = Math.max(0, max - files.length);

  const addFiles = (incoming: FileList | File[]) => {
    if (disabled) return;
    const list = Array.from(incoming);
    if (list.length === 0) return;

    const existing = new Set(files.map(fileKey));
    const accepted: File[] = [];
    let message: string | null = null;

    for (const file of list) {
      if (!file.type.startsWith("image/")) {
        message = `${file.name || "That file"} is not an image.`;
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        message = `${file.name || "That image"} is larger than 10 MB.`;
        continue;
      }
      const key = fileKey(file);
      if (existing.has(key)) continue;
      if (accepted.length >= remaining) {
        message = `You can add ${remaining} more image${remaining === 1 ? "" : "s"}.`;
        break;
      }
      existing.add(key);
      accepted.push(file);
    }

    if (accepted.length > 0) onChange([...files, ...accepted]);
    setError(message);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeAt = (index: number) => {
    onChange(files.filter((_, rowIndex) => rowIndex !== index));
    setError(null);
  };

  return (
    <section className={styles.picker}>
      <header className={styles.header}>
        <span className={styles.icon}>
          <ImagePlus size={16} />
        </span>
        <div>
          <h3 className={styles.title}>Images</h3>
          <p className={styles.text}>The first image becomes the storefront cover.</p>
        </div>
        <span className={styles.count}>
          {files.length}/{max}
        </span>
      </header>

      <div className={styles.grid}>
        {previews.map((preview, index) => (
          <figure key={`${fileKey(preview.file)}-${index}`} className={styles.card}>
            <img src={preview.url} alt={`Selected image ${index + 1}`} />
            {index === 0 && <span className={styles.cover}>Cover</span>}
            <button
              type="button"
              className={styles.remove}
              onClick={() => removeAt(index)}
              disabled={disabled}
              aria-label={`Remove image ${index + 1}`}
              title="Remove image"
            >
              <X size={13} />
            </button>
          </figure>
        ))}

        {remaining > 0 && (
          <label
            className={`${styles.upload} ${dragging ? styles.uploadActive : ""}`}
            onDragOver={(event) => {
              event.preventDefault();
              if (!disabled) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              if (event.dataTransfer.files?.length) addFiles(event.dataTransfer.files);
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className={styles.fileInput}
              onChange={(event) => {
                if (event.target.files?.length) addFiles(event.target.files);
              }}
              disabled={disabled}
            />
            <UploadCloud size={20} />
            <span>Add images</span>
            <small>Drop files or click</small>
          </label>
        )}
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          <AlertTriangle size={13} />
          <span>{error}</span>
        </p>
      ) : files.length === 0 ? (
        <p className={styles.hint}>
          At least one image is recommended so the product has a cover.
        </p>
      ) : null}

      {remaining === 0 && (
        <p className={styles.hint}>Image limit reached. Remove one to add another.</p>
      )}
    </section>
  );
}

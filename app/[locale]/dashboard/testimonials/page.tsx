"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  Check,
  Images,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";
import styles from "./testimonials.module.css";

interface TestimonialImage {
  name: string;
  url: string;
  size: number;
  modifiedAt: string;
}

function formatSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function TestimonialsAdminPage() {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "ar";

  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<TestimonialImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TestimonialImage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(
    null,
  );

  const loadImages = async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "refresh") setRefreshing(true);
    try {
      const response = await fetch("/api/dashboard/testimonials", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Request failed");
      setImages(data.images ?? []);
      setError(null);
    } catch (err) {
      console.error("Error loading testimonials:", err);
      setError("Could not load testimonial images.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const uploadFiles = async (files: File[]) => {
    const imagesToUpload = files.filter((file) => file.type.startsWith("image/"));
    if (imagesToUpload.length === 0) {
      setToast({ message: "Choose an image file to upload.", type: "error" });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      for (const file of imagesToUpload) formData.append("files", file);

      const response = await fetch("/api/dashboard/testimonials", {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Upload failed");

      setImages(data.images ?? []);
      setToast({
        message: `${imagesToUpload.length} image${
          imagesToUpload.length === 1 ? "" : "s"
        } uploaded to the Supabase Storage "testimonials" bucket.`,
        type: "success",
      });
    } catch (err) {
      console.error("Error uploading testimonials:", err);
      setToast({
        message: err instanceof Error ? err.message : "Could not upload the images.",
        type: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length > 0) void uploadFiles(files);
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (uploading) return;
    void uploadFiles(Array.from(event.dataTransfer.files ?? []));
  };

  const deleteImage = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await fetch(
        `/api/dashboard/testimonials?name=${encodeURIComponent(deleteTarget.name)}`,
        { method: "DELETE" },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Delete failed");

      setImages(data.images ?? []);
      setToast({ message: "Testimonial image deleted.", type: "success" });
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error deleting testimonial:", err);
      setToast({
        message: err instanceof Error ? err.message : "Could not delete the image.",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.headIcon}>
            <Images size={24} />
          </span>
          <div>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>Testimonials</h1>
              <span className={styles.countPill}>{images.length}</span>
            </div>
            <p className={styles.subtitle}>
              Screenshots shown in the storefront gallery, stored in the Supabase Storage{" "}
              <code>testimonials</code> bucket
            </p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <a className={styles.ghostButton} href={`/${locale}#testimonials-title`}>
            View on store
          </a>
          <button
            type="button"
            className={styles.ghostButton}
            onClick={() => loadImages("refresh")}
            disabled={refreshing || uploading}
          >
            <RefreshCw size={15} className={refreshing ? styles.spin : ""} />
            <span>{refreshing ? "Refreshing" : "Refresh"}</span>
          </button>
        </div>
      </header>

      <section
        className={`${styles.dropzone} ${dragging ? styles.dropzoneActive : ""} ${
          uploading ? styles.dropzoneBusy : ""
        }`}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && !uploading) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!uploading) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        aria-label="Upload testimonial images"
        aria-busy={uploading}
      >
        <span className={styles.dropzoneIcon}>
          {uploading ? (
            <RefreshCw size={26} className={styles.spin} />
          ) : (
            <UploadCloud size={26} />
          )}
        </span>
        <div className={styles.dropzoneText}>
          <strong>
            {uploading ? "Uploading screenshots..." : "Drop screenshots here or browse"}
          </strong>
          <span>
            Uploaded images are saved to the <code>testimonials</code> bucket in Supabase
            Storage and appear in the storefront gallery.
          </span>
          <small>JPG, PNG, WebP, AVIF or GIF · up to 10 MB each</small>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          multiple
          className={styles.fileInput}
          onChange={onFileChange}
          disabled={uploading}
          tabIndex={-1}
        />
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Gallery images</h2>
            <p className={styles.cardSubtitle}>
              The newest screenshot is featured first on the home page.
            </p>
          </div>
          <span className={styles.cardCount}>
            {images.length} image{images.length === 1 ? "" : "s"}
          </span>
        </div>

        {loading ? (
          <div className={styles.loadingBox}>
            <LoadingSpinner size={30} text="Loading testimonials..." />
          </div>
        ) : error ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>
              <AlertTriangle size={26} />
            </span>
            <h2 className={styles.emptyTitle}>{error}</h2>
            <p className={styles.emptyText}>Please try again in a moment.</p>
            <button
              type="button"
              className={styles.ghostButton}
              onClick={() => loadImages("refresh")}
            >
              <RefreshCw size={15} />
              <span>Retry</span>
            </button>
          </div>
        ) : images.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>
              <Images size={26} />
            </span>
            <h2 className={styles.emptyTitle}>No testimonial images yet</h2>
            <p className={styles.emptyText}>
              Upload your first client screenshot above. It will show up on the home page
              right away.
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {images.map((image, index) => (
              <article key={image.name} className={styles.imageCard}>
                <div className={styles.imageWrap}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={`Testimonial screenshot ${index + 1}`}
                    loading="lazy"
                  />
                  {index === 0 && <span className={styles.featuredBadge}>Featured</span>}
                </div>
                <div className={styles.imageBody}>
                  <span className={styles.imageName} title={image.name}>
                    {image.name}
                  </span>
                  <span className={styles.imageMeta}>
                    {formatSize(image.size)}
                    {formatDate(image.modifiedAt) ? ` · ${formatDate(image.modifiedAt)}` : ""}
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => setDeleteTarget(image)}
                  aria-label={`Delete ${image.name}`}
                  title="Delete image"
                >
                  <Trash2 size={16} />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !deleting && setDeleteTarget(null)}
          >
            <motion.div
              className={styles.dialog}
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 14 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-testimonial-title"
            >
              <span className={styles.dialogImage}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={deleteTarget.url} alt="" />
              </span>
              <h2 id="delete-testimonial-title" className={styles.dialogTitle}>
                Delete this image?
              </h2>
              <p className={styles.dialogText}>
                <strong>{deleteTarget.name}</strong> will be permanently removed from the
                Supabase Storage <code>testimonials</code> bucket and disappear from the
                storefront gallery. This cannot be undone.
              </p>
              <div className={styles.dialogActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.confirmDeleteButton}
                  onClick={deleteImage}
                  disabled={deleting}
                  autoFocus
                >
                  {deleting ? (
                    <>
                      <RefreshCw size={15} className={styles.spin} />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={15} />
                      Delete image
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            className={`${styles.toast} ${toast.type === "error" ? styles.toastError : ""}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            role="status"
          >
            {toast.type === "error" ? <AlertTriangle size={16} /> : <Check size={16} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  ImagePlus,
  Package,
  RefreshCw,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";
import ProductForm from "@/components/ProductForm/ProductForm";
import {
  MAX_PRODUCT_IMAGES,
  imageSrc,
  type AdminProduct,
} from "@/lib/product-admin";
import {
  payloadFromValues,
  valuesFromProduct,
  type ProductFormValues,
} from "@/lib/product-form";
import styles from "./edit.module.css";

function formatPrice(value: number, currency: string) {
  return `${Number(value || 0).toLocaleString()} ${currency || "DA"}`;
}

function formatDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ locale?: string; id: string }>();
  const locale = params?.locale || "ar";
  const id = params?.id;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [values, setValues] = useState<ProductFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(
    null,
  );

  const fetchProduct = async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/dashboard/products/${id}`, {
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Could not load the product.");
      }
      setProduct(data.product);
      setValues(valuesFromProduct(data.product));
      setError(null);
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(err instanceof Error ? err.message : "Could not load the product.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const search = new URLSearchParams(window.location.search);
    if (search.get("created") === "1") {
      const images = search.get("images");
      if (images === "failed") {
        setToast({
          message:
            "Product created, but the images could not be uploaded. Try again below.",
          type: "error",
        });
      } else if (images === "uploaded") {
        setToast({ message: "Product created with images.", type: "success" });
      } else {
        setToast({ message: "Product created. Add its images below.", type: "success" });
      }
      router.replace(`/${locale}/dashboard/products/${id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const dirty = useMemo(() => {
    if (!product || !values) return false;
    return (
      JSON.stringify(payloadFromValues(values)) !==
      JSON.stringify(payloadFromValues(valuesFromProduct(product)))
    );
  }, [product, values]);

  const saveProduct = async () => {
    if (!values || !id) return;
    if (!values.name.trim()) {
      setToast({ message: "Product name is required.", type: "error" });
      return;
    }
    if (values.price.trim() === "" || Number.isNaN(Number(values.price))) {
      setToast({ message: "Enter a valid price.", type: "error" });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/dashboard/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromValues(values)),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Save failed");

      setProduct(data.product);
      setValues(valuesFromProduct(data.product));
      setToast({ message: "Product saved.", type: "success" });
    } catch (err) {
      console.error("Error saving product:", err);
      setToast({
        message: err instanceof Error ? err.message : "Could not save the product.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const uploadFiles = async (files: FileList | File[]) => {
    if (!id) return;
    const list = Array.from(files);
    if (list.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      for (const file of list) formData.append("files", file);

      const response = await fetch(`/api/dashboard/products/${id}/images`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Upload failed");

      setProduct(data.product);
      setToast({
        message:
          data.uploaded?.length === 1
            ? "Image uploaded."
            : `${data.uploaded?.length ?? 0} images uploaded.`,
        type: "success",
      });
    } catch (err) {
      console.error("Error uploading images:", err);
      setToast({
        message: err instanceof Error ? err.message : "Could not upload the images.",
        type: "error",
      });
    } finally {
      setUploading(false);
      setDragging(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = async (image: string) => {
    if (!id) return;
    setDeletingImage(image);
    try {
      const response = await fetch(`/api/dashboard/products/${id}/images`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Delete failed");

      setProduct(data.product);
      setImageToDelete(null);
      setToast({ message: "Image removed.", type: "success" });
    } catch (err) {
      console.error("Error removing image:", err);
      setToast({
        message: err instanceof Error ? err.message : "Could not remove the image.",
        type: "error",
      });
    } finally {
      setDeletingImage(null);
    }
  };

  const deleteProduct = async () => {
    if (!id || !product) return;
    setDeletingProduct(true);
    try {
      const response = await fetch(`/api/dashboard/products/${id}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Delete failed");

      router.push(`/${locale}/dashboard/products`);
    } catch (err) {
      console.error("Error deleting product:", err);
      setToast({
        message: err instanceof Error ? err.message : "Could not delete the product.",
        type: "error",
      });
      setDeletingProduct(false);
      setDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <LoadingSpinner size={30} text="Loading product..." />
      </div>
    );
  }

  if (error || !product || !values) {
    return (
      <div className={styles.page}>
        <Link href={`/${locale}/dashboard/products`} className={styles.backLink}>
          <ArrowLeft size={15} />
          Back to products
        </Link>
        <div className={styles.errorCard}>
          <span className={styles.errorIcon}>
            <AlertTriangle size={26} />
          </span>
          <h1 className={styles.errorTitle}>{error || "Product not found"}</h1>
          <p className={styles.errorText}>
            The product may have been deleted, or the link is incorrect.
          </p>
          <div className={styles.errorActions}>
            <button type="button" className={styles.ghostButton} onClick={fetchProduct}>
              <RefreshCw size={15} />
              Retry
            </button>
            <Link href={`/${locale}/dashboard/products`} className={styles.primaryButton}>
              Back to products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = product.images;
  const slotsLeft = Math.max(0, MAX_PRODUCT_IMAGES - images.length);
  const created = formatDate(product.created_at);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headingWrap}>
          <Link href={`/${locale}/dashboard/products`} className={styles.backLink}>
            <ArrowLeft size={15} />
            Products
          </Link>
          <div className={styles.heading}>
            <span className={styles.headIcon}>
              {images[0] ? (
                <img src={imageSrc(images[0])} alt="" />
              ) : (
                <Package size={22} />
              )}
            </span>
            <div className={styles.headingText}>
              <div className={styles.titleRow}>
                <h1 className={styles.title}>{product.name || "Untitled product"}</h1>
                <span
                  className={`${styles.visibilityChip} ${
                    product.active ? styles.visible : styles.hidden
                  }`}
                >
                  {product.active ? <Eye size={12} /> : <EyeOff size={12} />}
                  {product.active ? "Visible" : "Hidden"}
                </span>
                {dirty && <span className={styles.dirtyChip}>Unsaved changes</span>}
              </div>
              <p className={styles.subtitle}>
                #{product.id} · {product.brand || "No brand"} ·{" "}
                {formatPrice(product.price, product.currency)}
                {created ? ` · Added ${created}` : ""}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.headerActions}>
          <Link
            href={`/${locale}/product/${product.id}`}
            target="_blank"
            rel="noreferrer"
            className={styles.ghostButton}
          >
            <ExternalLink size={15} />
            View on store
          </Link>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={saveProduct}
            disabled={saving}
          >
            {saving ? (
              <>
                <RefreshCw size={15} className={styles.spin} />
                Saving...
              </>
            ) : (
              <>
                <Save size={15} />
                Save changes
              </>
            )}
          </button>
        </div>
      </header>

      <div className={styles.layout}>
        <main className={styles.main}>
          <ProductForm values={values} onChange={setValues} disabled={saving} />
        </main>

        <aside className={styles.side}>
          <section className={styles.panel}>
            <header className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Images</h2>
                <p className={styles.panelText}>
                  The first image is used as the storefront cover.
                </p>
              </div>
              <span className={styles.panelCount}>
                {images.length}/{MAX_PRODUCT_IMAGES}
              </span>
            </header>

            <div className={styles.imageGrid}>
              {images.map((image, index) => (
                <figure key={image} className={styles.imageCard}>
                  <img src={imageSrc(image)} alt={`${product.name} image ${index + 1}`} />
                  {index === 0 && <span className={styles.coverBadge}>Cover</span>}
                  <button
                    type="button"
                    className={styles.imageDelete}
                    onClick={() => setImageToDelete(image)}
                    disabled={Boolean(deletingImage)}
                    aria-label={`Delete image ${index + 1}`}
                    title="Delete image"
                  >
                    {deletingImage === image ? (
                      <RefreshCw size={13} className={styles.spin} />
                    ) : (
                      <Trash2 size={13} />
                    )}
                  </button>
                </figure>
              ))}

              {slotsLeft > 0 && (
                <label
                  className={`${styles.uploadTile} ${dragging ? styles.uploadTileActive : ""}`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);
                    if (event.dataTransfer.files?.length) {
                      uploadFiles(event.dataTransfer.files);
                    }
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className={styles.fileInput}
                    onChange={(event) => {
                      if (event.target.files?.length) uploadFiles(event.target.files);
                    }}
                    disabled={uploading}
                  />
                  {uploading ? (
                    <>
                      <RefreshCw size={20} className={styles.spin} />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={20} />
                      <span>Upload images</span>
                      <small>Drop files or click</small>
                    </>
                  )}
                </label>
              )}
            </div>

            {images.length === 0 && (
              <p className={styles.imageHint}>
                <ImagePlus size={14} />
                No images yet. Upload at least one so the product has a cover.
              </p>
            )}
            {slotsLeft === 0 && (
              <p className={styles.imageHint}>
                Image limit reached. Remove an image before uploading another.
              </p>
            )}
            <p className={styles.storageNote}>
              Uploads go to the Supabase <code>product-images</code> bucket. Images
              already in <code>/public</code> can be removed from the product but are not
              deleted from disk.
            </p>
          </section>

          <section className={styles.panel}>
            <header className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Product details</h2>
                <p className={styles.panelText}>A quick summary of this record.</p>
              </div>
            </header>
            <dl className={styles.metaList}>
              <div>
                <dt>Product ID</dt>
                <dd>#{product.id}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd className={styles.capitalize}>{product.category}</dd>
              </div>
              <div>
                <dt>Stock</dt>
                <dd>{product.stock === null ? "Unlimited" : product.stock}</dd>
              </div>
              <div>
                <dt>Sort order</dt>
                <dd>{product.sort_order}</dd>
              </div>
              <div>
                <dt>Colors</dt>
                <dd>{product.colors.length > 0 ? product.colors.join(", ") : "—"}</dd>
              </div>
            </dl>
          </section>

          <section className={`${styles.panel} ${styles.dangerPanel}`}>
            <header className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Danger zone</h2>
                <p className={styles.panelText}>
                  Deleting removes the product and its uploaded images.
                </p>
              </div>
            </header>
            <button
              type="button"
              className={styles.dangerButton}
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 size={15} />
              Delete product
            </button>
          </section>
        </aside>
      </div>

      <AnimatePresence>
        {imageToDelete && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !deletingImage && setImageToDelete(null)}
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
            >
              <span className={styles.dialogImage}>
                <img src={imageSrc(imageToDelete)} alt="" />
              </span>
              <h2 className={styles.dialogTitle}>Delete this image?</h2>
              <p className={styles.dialogText}>
                It will be removed from the product. Images in Supabase Storage are
                deleted permanently.
              </p>
              <div className={styles.dialogActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setImageToDelete(null)}
                  disabled={Boolean(deletingImage)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => removeImage(imageToDelete)}
                  disabled={Boolean(deletingImage)}
                >
                  {deletingImage ? (
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
        {deleteOpen && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !deletingProduct && setDeleteOpen(false)}
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
            >
              <span className={styles.dialogIcon}>
                <AlertTriangle size={22} />
              </span>
              <h2 className={styles.dialogTitle}>Delete product?</h2>
              <p className={styles.dialogText}>
                &ldquo;{product.name}&rdquo; and its uploaded images will be permanently
                removed. This action cannot be undone.
              </p>
              <div className={styles.dialogActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setDeleteOpen(false)}
                  disabled={deletingProduct}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={deleteProduct}
                  disabled={deletingProduct}
                >
                  {deletingProduct ? (
                    <>
                      <RefreshCw size={15} className={styles.spin} />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={15} />
                      Delete product
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

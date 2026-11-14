"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  Package,
  PackageOpen,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Watch,
  X,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";
import ProductForm from "@/components/ProductForm/ProductForm";
import ProductImagePicker from "@/components/ProductImagePicker/ProductImagePicker";
import { imageSrc, type AdminProduct } from "@/lib/product-admin";
import {
  emptyProductFormValues,
  payloadFromValues,
  type ProductFormValues,
} from "@/lib/product-form";
import styles from "./products.module.css";

type FilterKey = "all" | "active" | "hidden" | "limited" | "low" | "out";

function formatPrice(value: number, currency: string) {
  return `${Number(value || 0).toLocaleString()} ${currency || "DA"}`;
}

function stockOf(product: AdminProduct): number | null {
  return typeof product.stock === "number" ? product.stock : null;
}

function isOut(product: AdminProduct) {
  const stock = stockOf(product);
  return product.availability === "sold-out" || (stock !== null && stock <= 0);
}

function isLow(product: AdminProduct) {
  const stock = stockOf(product);
  return stock !== null && stock > 0 && stock <= 5;
}

/** The low-stock count badge is opt-in from the dashboard. */
function isLowStockBadgeEnabled(product: AdminProduct) {
  return product.availability === "limited" && !isOut(product);
}

export default function ProductsPage() {
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "ar";

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [createValues, setCreateValues] = useState<ProductFormValues>(
    emptyProductFormValues(),
  );
  const [createImages, setCreateImages] = useState<File[]>([]);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(
    null,
  );

  const fetchProducts = async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "refresh") setRefreshing(true);
    try {
      const response = await fetch("/api/dashboard/products", { cache: "no-store" });
      if (!response.ok) throw new Error("Request failed");
      const data = await response.json();
      setProducts(data.products ?? []);
      setError(null);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Could not load products.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  const stats = useMemo(() => {
    return {
      total: products.length,
      active: products.filter((product) => product.active).length,
      low: products.filter(isLow).length,
      out: products.filter(isOut).length,
    };
  }, [products]);

  const counts = useMemo(() => {
    return {
      all: products.length,
      active: products.filter((product) => product.active).length,
      hidden: products.filter((product) => !product.active).length,
      limited: products.filter(isLowStockBadgeEnabled).length,
      low: products.filter(isLow).length,
      out: products.filter(isOut).length,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      if (filter === "active" && !product.active) return false;
      if (filter === "hidden" && product.active) return false;
      if (filter === "limited" && !isLowStockBadgeEnabled(product)) return false;
      if (filter === "low" && !isLow(product)) return false;
      if (filter === "out" && !isOut(product)) return false;
      if (!q) return true;
      return [product.name, product.brand, product.category, product.badge, String(product.id)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [products, query, filter]);

  const openCreate = () => {
    setCreateValues(emptyProductFormValues());
    setCreateImages([]);
    setCreateOpen(true);
  };

  const createProduct = async () => {
    if (!createValues.name.trim()) {
      setToast({ message: "Give the product a name first.", type: "error" });
      return;
    }
    if (createValues.price.trim() === "" || Number.isNaN(Number(createValues.price))) {
      setToast({ message: "Enter a valid price.", type: "error" });
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/dashboard/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromValues(createValues)),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Create failed");

      const productId = data.product.id;
      let imageState: "none" | "uploaded" | "failed" = "none";

      if (createImages.length > 0) {
        try {
          const formData = new FormData();
          for (const file of createImages) formData.append("files", file);

          const uploadResponse = await fetch(
            `/api/dashboard/products/${productId}/images`,
            { method: "POST", body: formData },
          );

          if (uploadResponse.ok) {
            imageState = "uploaded";
          } else {
            imageState = "failed";
            const uploadData = await uploadResponse.json().catch(() => ({}));
            console.error("Error uploading product images:", uploadData?.error);
          }
        } catch (err) {
          imageState = "failed";
          console.error("Error uploading product images:", err);
        }
      }

      setCreateOpen(false);
      setCreateValues(emptyProductFormValues());
      setCreateImages([]);

      const query = new URLSearchParams({ created: "1" });
      if (imageState !== "none") query.set("images", imageState);
      router.push(`/${locale}/dashboard/products/${productId}?${query.toString()}`);
    } catch (err) {
      console.error("Error creating product:", err);
      setToast({
        message: err instanceof Error ? err.message : "Could not create the product.",
        type: "error",
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteProduct = async (product: AdminProduct) => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/dashboard/products/${product.id}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Delete failed");

      setProducts((current) => current.filter((entry) => entry.id !== product.id));
      setDeleteTarget(null);
      setToast({ message: `"${product.name}" deleted.`, type: "success" });
    } catch (err) {
      console.error("Error deleting product:", err);
      setToast({
        message: err instanceof Error ? err.message : "Could not delete the product.",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const openEditor = (product: AdminProduct) => {
    router.push(`/${locale}/dashboard/products/${product.id}`);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.headIcon}>
            <Package size={24} />
          </span>
          <div>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>Products</h1>
              <span className={styles.countPill}>{products.length}</span>
            </div>
            <p className={styles.subtitle}>
              Manage your catalogue, pricing, stock and product images
            </p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.ghostButton}
            onClick={() => fetchProducts("refresh")}
            disabled={refreshing}
          >
            <RefreshCw size={15} className={refreshing ? styles.spin : ""} />
            <span>{refreshing ? "Refreshing" : "Refresh"}</span>
          </button>
          <button type="button" className={styles.primaryButton} onClick={openCreate}>
            <Plus size={16} />
            <span>New product</span>
          </button>
        </div>
      </header>

      <section className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>
            <Package size={18} />
          </span>
          <div>
            <strong>{stats.total}</strong>
            <small>Total products</small>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.statGreen}`}>
            <Check size={18} />
          </span>
          <div>
            <strong>{stats.active}</strong>
            <small>Visible in store</small>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.statAmber}`}>
            <AlertTriangle size={18} />
          </span>
          <div>
            <strong>{stats.low}</strong>
            <small>Low stock</small>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.statRed}`}>
            <PackageOpen size={18} />
          </span>
          <div>
            <strong>{stats.out}</strong>
            <small>Out of stock</small>
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, brand, category or ID"
              className={styles.searchInput}
              aria-label="Search products"
            />
            {query && (
              <button
                type="button"
                className={styles.clearSearch}
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className={styles.filters}>
            {(
              [
                ["all", "All"],
                ["active", "Visible"],
                ["hidden", "Hidden"],
                ["limited", "Low-stock badge"],
                ["low", "Low stock (≤5)"],
                ["out", "Sold out"],
              ] as Array<[FilterKey, string]>
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`${styles.filterChip} ${filter === key ? styles.filterChipActive : ""}`}
                onClick={() => setFilter(key)}
              >
                {label}
                <span className={styles.filterCount}>{counts[key]}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingBox}>
            <LoadingSpinner size={30} text="Loading products..." />
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
              onClick={() => fetchProducts("refresh")}
            >
              <RefreshCw size={15} />
              <span>Retry</span>
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>
              <PackageOpen size={26} />
            </span>
            <h2 className={styles.emptyTitle}>
              {products.length === 0 ? "No products yet" : "No matching products"}
            </h2>
            <p className={styles.emptyText}>
              {products.length === 0
                ? "Create your first product to start building the storefront catalogue."
                : "Try a different search term or filter."}
            </p>
            {products.length === 0 ? (
              <button type="button" className={styles.primaryButton} onClick={openCreate}>
                <Plus size={16} />
                <span>New product</span>
              </button>
            ) : (
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th className={styles.actionsHead}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const out = isOut(product);
                  const limited = isLowStockBadgeEnabled(product);
                  const low = isLow(product);
                  return (
                    <tr
                      key={product.id}
                      className={styles.row}
                      onClick={() => openEditor(product)}
                    >
                      <td data-label="Product">
                        <div className={styles.productCell}>
                          <span className={styles.thumb}>
                            {product.images[0] ? (
                              <img
                                src={imageSrc(product.images[0])}
                                alt=""
                                loading="lazy"
                              />
                            ) : (
                              <Watch size={20} />
                            )}
                          </span>
                          <span className={styles.productText}>
                            <strong>{product.name}</strong>
                            <small>
                              {product.brand || "No brand"}
                              <span className={styles.idText}>#{product.id}</span>
                            </small>
                          </span>
                        </div>
                      </td>
                      <td data-label="Category">
                        <span className={styles.category}>{product.category}</span>
                      </td>
                      <td data-label="Price">
                        <span className={styles.price}>
                          {formatPrice(product.price, product.currency)}
                        </span>
                      </td>
                      <td data-label="Stock">
                        <span
                          className={`${styles.stock} ${out ? styles.stockOut : low ? styles.stockLow : ""}`}
                        >
                          {stockOf(product) === null ? "∞" : stockOf(product)}
                        </span>
                      </td>
                      <td data-label="Status">
                        <div className={styles.statusCell}>
                          <span
                            className={`${styles.statusChip} ${
                              product.active ? styles.statusVisible : styles.statusHidden
                            }`}
                          >
                            {product.active ? <Eye size={12} /> : <EyeOff size={12} />}
                            {product.active ? "Visible" : "Hidden"}
                          </span>
                          {limited && (
                            <span className={styles.statusChipWarning}>Low-stock badge</span>
                          )}
                          {out && <span className={styles.statusChipDanger}>Sold out</span>}
                        </div>
                      </td>
                      <td data-label="Actions" onClick={(event) => event.stopPropagation()}>
                        <div className={styles.rowActions}>
                          <button
                            type="button"
                            className={styles.iconButton}
                            onClick={() => openEditor(product)}
                            aria-label={`Edit ${product.name}`}
                            title="Edit product"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            className={`${styles.iconButton} ${styles.danger}`}
                            onClick={() => setDeleteTarget(product)}
                            aria-label={`Delete ${product.name}`}
                            title="Delete product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className={styles.tableFooter}>
            Showing {filteredProducts.length} of {products.length} products
          </div>
        )}
      </section>

      <AnimatePresence>
        {createOpen && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !creating && setCreateOpen(false)}
          >
            <motion.div
              className={styles.createDialog}
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-product-title"
            >
              <header className={styles.dialogHeader}>
                <div>
                  <h2 id="create-product-title" className={styles.dialogTitle}>
                    New product
                  </h2>
                  <p className={styles.dialogSubtitle}>
                    Add the essentials and upload images in one go.
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={() => setCreateOpen(false)}
                  disabled={creating}
                  aria-label="Close"
                >
                  <X size={17} />
                </button>
              </header>

              <div className={styles.dialogBody}>
                <ProductForm
                  values={createValues}
                  onChange={setCreateValues}
                  disabled={creating}
                  compact
                />
                <ProductImagePicker
                  files={createImages}
                  onChange={setCreateImages}
                  disabled={creating}
                />
              </div>

              <footer className={styles.dialogFooter}>
                <button
                  type="button"
                  className={styles.ghostButton}
                  onClick={() => setCreateOpen(false)}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={createProduct}
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <RefreshCw size={15} className={styles.spin} />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={15} />
                      <span>Create product</span>
                    </>
                  )}
                </button>
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            >
              <span className={styles.dialogIcon}>
                <AlertTriangle size={22} />
              </span>
              <h2 className={styles.dialogTitle}>Delete product?</h2>
              <p className={styles.dialogText}>
                &ldquo;{deleteTarget.name}&rdquo; will be permanently removed, along with its
                uploaded images. This action cannot be undone.
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
                  className={styles.deleteButton}
                  onClick={() => deleteProduct(deleteTarget)}
                  disabled={deleting}
                >
                  {deleting ? (
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

"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  Check,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Truck,
  X,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";
import styles from "./delivery.module.css";

type DeliveryRow = {
  wilaya: string;
  home: number;
  desk: number;
  offices: string[];
};

type DeliveryResponse = {
  shippingPrices: Record<string, { home: number; desk: number }>;
  officeLocations: Record<string, string[]>;
};

function rowsFromResponse(data: DeliveryResponse): DeliveryRow[] {
  return Object.keys(data.shippingPrices).map((wilaya) => ({
    wilaya,
    home: data.shippingPrices[wilaya].home,
    desk: data.shippingPrices[wilaya].desk,
    offices: data.officeLocations[wilaya] ?? [],
  }));
}

function formatPrice(value: number) {
  return `${Number(value || 0).toLocaleString()} DA`;
}

export default function DeliveryPage() {
  const [rows, setRows] = useState<DeliveryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [editingWilaya, setEditingWilaya] = useState<string | null>(null);
  const [draft, setDraft] = useState<DeliveryRow | null>(null);
  const [newOffice, setNewOffice] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchDelivery = async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "refresh") setRefreshing(true);
    try {
      const response = await fetch("/api/dashboard/delivery", { cache: "no-store" });
      if (!response.ok) throw new Error("Request failed");
      const data = (await response.json()) as DeliveryResponse;
      setRows(rowsFromResponse(data));
      setError(null);
    } catch (err) {
      console.error("Error fetching delivery data:", err);
      setError("Could not load delivery data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDelivery();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (row) =>
        row.wilaya.toLowerCase().includes(q) ||
        row.offices.some((office) => office.toLowerCase().includes(q)),
    );
  }, [rows, query]);

  const stats = useMemo(() => {
    const withDesks = rows.filter((row) => row.offices.length > 0).length;
    const deskCount = rows.reduce((total, row) => total + row.offices.length, 0);
    const homeAverage = rows.length
      ? Math.round(rows.reduce((total, row) => total + row.home, 0) / rows.length)
      : 0;
    return { withDesks, deskCount, homeAverage };
  }, [rows]);

  const startEditing = (row: DeliveryRow) => {
    setEditingWilaya(row.wilaya);
    setDraft({ ...row, offices: [...row.offices] });
    setNewOffice("");
  };

  const cancelEditing = () => {
    setEditingWilaya(null);
    setDraft(null);
    setNewOffice("");
  };

  const updateDraft = (changes: Partial<DeliveryRow>) => {
    setDraft((current) => (current ? { ...current, ...changes } : current));
  };

  const addOffice = () => {
    if (!draft) return;
    const office = newOffice.trim();
    if (!office) return;
    if (draft.offices.some((existing) => existing.toLowerCase() === office.toLowerCase())) {
      setNewOffice("");
      return;
    }
    updateDraft({ offices: [...draft.offices, office] });
    setNewOffice("");
  };

  const removeOffice = (office: string) => {
    if (!draft) return;
    updateDraft({ offices: draft.offices.filter((existing) => existing !== office) });
  };

  const saveRow = async () => {
    if (!draft || saving) return;

    const home = Number(draft.home);
    const desk = Number(draft.desk);

    if (!Number.isInteger(home) || !Number.isInteger(desk) || home < 0 || desk < 0) {
      setToast({ message: "Prices must be whole numbers of 0 or more.", type: "error" });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/dashboard/delivery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wilaya: draft.wilaya,
          home,
          desk,
          offices: draft.offices,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Update failed");
      }

      setRows(rowsFromResponse(data as DeliveryResponse));
      setEditingWilaya(null);
      setDraft(null);
      setNewOffice("");
      setToast({ message: `${draft.wilaya} delivery settings saved.`, type: "success" });
    } catch (err) {
      console.error("Error updating delivery data:", err);
      setToast({
        message: err instanceof Error ? err.message : "Could not update delivery data.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.headIcon}>
            <Truck size={24} />
          </span>
          <div>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>Delivery</h1>
              <span className={styles.countPill}>{rows.length} wilayas</span>
            </div>
            <p className={styles.subtitle}>
              Manage home delivery and stop-desk pricing, and the desks available in each wilaya.
            </p>
          </div>
        </div>

        <button
          type="button"
          className={styles.ghostButton}
          onClick={() => fetchDelivery("refresh")}
          disabled={refreshing}
        >
          <RefreshCw size={15} className={refreshing ? styles.spin : ""} />
          <span>{refreshing ? "Refreshing" : "Refresh"}</span>
        </button>
      </header>

      <section className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Wilayas covered</span>
          <strong className={styles.statValue}>{rows.length}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Stop-desk wilayas</span>
          <strong className={styles.statValue}>{stats.withDesks}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Available desks</span>
          <strong className={styles.statValue}>{stats.deskCount}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Average home price</span>
          <strong className={styles.statValue}>{formatPrice(stats.homeAverage)}</strong>
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
              placeholder="Search by wilaya or desk"
              className={styles.searchInput}
              aria-label="Search delivery wilayas"
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
          <p className={styles.toolbarHint}>
            Changes are saved to the Supabase <code>delivery</code> table.
          </p>
        </div>

        {loading ? (
          <div className={styles.loadingBox}>
            <LoadingSpinner size={30} text="Loading delivery data..." />
          </div>
        ) : error ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>
              <AlertTriangle size={26} />
            </span>
            <h2 className={styles.emptyTitle}>{error}</h2>
            <p className={styles.emptyText}>Please try again in a moment.</p>
            <button type="button" className={styles.ghostButton} onClick={() => fetchDelivery("refresh")}>
              <RefreshCw size={15} />
              <span>Retry</span>
            </button>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>
              <Search size={26} />
            </span>
            <h2 className={styles.emptyTitle}>No matching wilayas</h2>
            <p className={styles.emptyText}>Try a different wilaya or desk name.</p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Wilaya</th>
                  <th>Home delivery</th>
                  <th>Stop-desk</th>
                  <th>Desks</th>
                  <th className={styles.actionsHead}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const rowDraft = editingWilaya === row.wilaya ? draft : null;
                  return (
                    <tr key={row.wilaya} className={rowDraft ? styles.rowEditing : styles.row}>
                      <td data-label="Wilaya">
                        <div className={styles.wilayaCell}>
                          <span className={styles.wilayaIcon}>
                            <MapPin size={15} />
                          </span>
                          <strong className={styles.wilayaName}>{row.wilaya}</strong>
                        </div>
                      </td>
                      <td data-label="Home delivery">
                        {rowDraft ? (
                          <input
                            type="number"
                            min={0}
                            step={1}
                            value={rowDraft.home}
                            onChange={(event) => updateDraft({ home: Number(event.target.value) })}
                            className={styles.priceInput}
                            aria-label={`Home delivery price for ${row.wilaya}`}
                          />
                        ) : (
                          <span className={styles.priceValue}>{formatPrice(row.home)}</span>
                        )}
                      </td>
                      <td data-label="Stop-desk">
                        {rowDraft ? (
                          <input
                            type="number"
                            min={0}
                            step={1}
                            value={rowDraft.desk}
                            onChange={(event) => updateDraft({ desk: Number(event.target.value) })}
                            className={styles.priceInput}
                            aria-label={`Stop-desk price for ${row.wilaya}`}
                          />
                        ) : row.offices.length === 0 ? (
                          <span className={styles.priceMuted}>Not available</span>
                        ) : (
                          <span className={styles.priceValue}>{formatPrice(row.desk)}</span>
                        )}
                      </td>
                      <td data-label="Desks">
                        {rowDraft ? (
                          <div className={styles.officeEditor}>
                            <div className={styles.deskList}>
                              {rowDraft.offices.length === 0 && (
                                <span className={styles.priceMuted}>No desks yet</span>
                              )}
                              {rowDraft.offices.map((office) => (
                                <span key={office} className={`${styles.deskChip} ${styles.deskChipEditable}`}>
                                  {office}
                                  <button
                                    type="button"
                                    className={styles.deskChipRemove}
                                    onClick={() => removeOffice(office)}
                                    aria-label={`Remove ${office}`}
                                  >
                                    <X size={11} />
                                  </button>
                                </span>
                              ))}
                            </div>
                            <div className={styles.officeAddRow}>
                              <input
                                type="text"
                                value={newOffice}
                                onChange={(event) => setNewOffice(event.target.value)}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") {
                                    event.preventDefault();
                                    addOffice();
                                  }
                                }}
                                placeholder="Add a desk"
                                className={styles.officeInput}
                                aria-label={`Add a desk in ${row.wilaya}`}
                              />
                              <button
                                type="button"
                                className={styles.addButton}
                                onClick={addOffice}
                                aria-label={`Add desk in ${row.wilaya}`}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        ) : row.offices.length === 0 ? (
                          <span className={styles.priceMuted}>No desks</span>
                        ) : (
                          <div className={styles.deskList}>
                            {row.offices.slice(0, 4).map((office) => (
                              <span key={office} className={styles.deskChip}>
                                {office}
                              </span>
                            ))}
                            {row.offices.length > 4 && (
                              <span className={`${styles.deskChip} ${styles.moreChip}`}>
                                +{row.offices.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td data-label="Actions">
                        {rowDraft ? (
                          <div className={styles.rowActions}>
                            <button
                              type="button"
                              className={`${styles.iconButton} ${styles.saveButton}`}
                              onClick={saveRow}
                              disabled={saving}
                              aria-label={`Save ${row.wilaya}`}
                              title="Save"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              type="button"
                              className={styles.iconButton}
                              onClick={cancelEditing}
                              disabled={saving}
                              aria-label={`Cancel editing ${row.wilaya}`}
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className={styles.rowActions}>
                            <button
                              type="button"
                              className={styles.iconButton}
                              onClick={() => startEditing(row)}
                              aria-label={`Edit ${row.wilaya}`}
                              title="Edit delivery settings"
                            >
                              <Pencil size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && filteredRows.length > 0 && (
          <div className={styles.tableFooter}>
            Showing {filteredRows.length} of {rows.length} wilayas
          </div>
        )}
      </section>

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

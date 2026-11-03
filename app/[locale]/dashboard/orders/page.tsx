"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  Eye,
  PackageOpen,
  RefreshCw,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";
import OrderDetailsModal from "@/components/OrderDetailsModal/OrderDetailsModal";
import styles from "./orders.module.css";

interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  grand_total: number | string;
  status: string;
  wilaya?: string;
  city?: string;
  order_items?: unknown[];
}

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function orderNumber(id: number) {
  return `#${String(id).padStart(4, "0")}`;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchOrders = async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "refresh") setRefreshing(true);
    try {
      const response = await fetch("/api/dashboard/orders", { cache: "no-store" });
      if (!response.ok) throw new Error("Request failed");
      const data = await response.json();
      setOrders(data.orders ?? []);
      setError(null);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Could not load orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      if (!matchesStatus) return false;
      if (!q) return true;
      return [order.customer_name, order.customer_phone, order.wilaya, order.city, String(order.id)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [orders, query, statusFilter]);

  const statusCounts = useMemo(() => {
    return orders.reduce<Record<string, number>>((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
  }, [orders]);

  const updateStatus = async (orderId: number, status: string) => {
    setUpdatingId(orderId);
    const previous = orders;
    setOrders((current) =>
      current.map((order) => (order.id === orderId ? { ...order, status } : order)),
    );
    try {
      const response = await fetch("/api/dashboard/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      if (!response.ok) throw new Error("Update failed");
      setToast({ message: `Order ${orderNumber(orderId)} moved to ${STATUS_LABELS[status] ?? status}.`, type: "success" });
      fetchOrders("refresh");
    } catch (err) {
      console.error("Error updating order:", err);
      setOrders(previous);
      setToast({ message: "Could not update the order status.", type: "error" });
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteOrder = async (orderId: number) => {
    const previous = orders;
    setOrders((current) => current.filter((order) => order.id !== orderId));
    try {
      const response = await fetch(`/api/dashboard/orders?orderId=${orderId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Delete failed");
      setToast({ message: `Order ${orderNumber(orderId)} deleted.`, type: "success" });
    } catch (err) {
      console.error("Error deleting order:", err);
      setOrders(previous);
      setToast({ message: "Could not delete the order.", type: "error" });
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.headIcon}>
            <ShoppingCart size={24} />
          </span>
          <div>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>Orders</h1>
              <span className={styles.countPill}>{orders.length}</span>
            </div>
            <p className={styles.subtitle}>Track, update and manage customer orders</p>
          </div>
        </div>

        <button
          type="button"
          className={styles.ghostButton}
          onClick={() => fetchOrders("refresh")}
          disabled={refreshing}
        >
          <RefreshCw size={15} className={refreshing ? styles.spin : ""} />
          <span>{refreshing ? "Refreshing" : "Refresh"}</span>
        </button>
      </header>

      <section className={styles.card}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, phone, wilaya or order #"
              className={styles.searchInput}
              aria-label="Search orders"
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
            <button
              type="button"
              className={`${styles.filterChip} ${statusFilter === "all" ? styles.filterChipActive : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All
              <span className={styles.filterCount}>{orders.length}</span>
            </button>
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`${styles.filterChip} ${statusFilter === option.value ? styles.filterChipActive : ""}`}
                onClick={() => setStatusFilter(option.value)}
              >
                {option.label}
                <span className={styles.filterCount}>{statusCounts[option.value] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingBox}>
            <LoadingSpinner size={30} text="Loading orders..." />
          </div>
        ) : error ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>
              <AlertTriangle size={26} />
            </span>
            <h2 className={styles.emptyTitle}>{error}</h2>
            <p className={styles.emptyText}>Please try again in a moment.</p>
            <button type="button" className={styles.ghostButton} onClick={() => fetchOrders("refresh")}>
              <RefreshCw size={15} />
              <span>Retry</span>
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>
              <PackageOpen size={26} />
            </span>
            <h2 className={styles.emptyTitle}>
              {orders.length === 0 ? "No orders yet" : "No matching orders"}
            </h2>
            <p className={styles.emptyText}>
              {orders.length === 0
                ? "New orders will show up here as soon as customers check out."
                : "Try a different search term or status filter."}
            </p>
            {orders.length > 0 && (
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => {
                  setQuery("");
                  setStatusFilter("all");
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
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th className={styles.actionsHead}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className={styles.row}
                    onClick={() => openOrderDetails(order)}
                  >
                    <td data-label="Order">
                      <span className={styles.orderId}>{orderNumber(order.id)}</span>
                    </td>
                    <td data-label="Customer">
                      <div className={styles.customer}>
                        <span className={styles.avatar}>{initials(order.customer_name)}</span>
                        <span className={styles.customerText}>
                          <strong>{order.customer_name}</strong>
                          {order.wilaya && <small>{order.wilaya}</small>}
                        </span>
                      </div>
                    </td>
                    <td data-label="Phone">
                      <span className={styles.phone}>{order.customer_phone}</span>
                    </td>
                    <td data-label="Total">
                      <span className={styles.total}>
                        {Number(order.grand_total || 0).toLocaleString()} DA
                      </span>
                    </td>
                    <td data-label="Status" onClick={(event) => event.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={(event) => updateStatus(order.id, event.target.value)}
                        disabled={updatingId === order.id}
                        className={`${styles.statusSelect} ${styles[`status_${order.status}`] ?? ""}`}
                        aria-label={`Status for order ${order.id}`}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td data-label="Actions" onClick={(event) => event.stopPropagation()}>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.iconButton}
                          onClick={() => openOrderDetails(order)}
                          aria-label={`View order ${order.id}`}
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          className={`${styles.iconButton} ${styles.danger}`}
                          onClick={() => setDeleteTarget(order)}
                          aria-label={`Delete order ${order.id}`}
                          title="Delete order"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && filteredOrders.length > 0 && (
          <div className={styles.tableFooter}>
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        )}
      </section>

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteTarget(null)}
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
              <h2 className={styles.dialogTitle}>Delete order?</h2>
              <p className={styles.dialogText}>
                Order {orderNumber(deleteTarget.id)} for {deleteTarget.customer_name} will be
                permanently removed. This action cannot be undone.
              </p>
              <div className={styles.dialogActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => {
                    const id = deleteTarget.id;
                    setDeleteTarget(null);
                    deleteOrder(id);
                  }}
                >
                  <Trash2 size={15} />
                  Delete order
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
            {toast.type === "error" ? <AlertTriangle size={16} /> : <ShoppingCart size={16} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

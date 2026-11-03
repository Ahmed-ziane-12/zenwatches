"use client";

import { X, User, Phone, MapPin, Truck, Package, Receipt } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import styles from "./OrderDetailsModal.module.css";

interface OrderDetailsModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_META: Record<string, { label: string; className: string }> = {
  new: { label: "New", className: "statusNew" },
  processing: { label: "Processing", className: "statusProcessing" },
  shipped: { label: "Shipped", className: "statusShipped" },
  delivered: { label: "Delivered", className: "statusDelivered" },
  cancelled: { label: "Cancelled", className: "statusCancelled" },
};

function formatDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function money(value: unknown) {
  return `${Number(value || 0).toLocaleString()} DA`;
}

export default function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  if (!order) return null;

  const status = STATUS_META[order.status] ?? {
    label: order.status ?? "Unknown",
    className: "statusNew",
  };
  const items: any[] = order.order_items ?? [];
  const itemCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const date = formatDate(order.created_at);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <header className={styles.header}>
              <div className={styles.headerMain}>
                <span className={styles.headerIcon}>
                  <Receipt size={20} />
                </span>
                <div>
                  <p className={styles.eyebrow}>Order details</p>
                  <h2 className={styles.title}>#{String(order.id).padStart(4, "0")}</h2>
                  {date && <p className={styles.date}>{date}</p>}
                </div>
              </div>

              <div className={styles.headerRight}>
                <span className={`${styles.statusBadge} ${styles[status.className]}`}>
                  <span className={styles.statusDot} />
                  {status.label}
                </span>
                <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                  <X size={18} />
                </button>
              </div>
            </header>

            <div className={styles.content}>
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Customer</h3>
                <div className={styles.grid}>
                  <div className={styles.field}>
                    <span className={styles.fieldIcon}>
                      <User size={15} />
                    </span>
                    <span className={styles.fieldBody}>
                      <span className={styles.fieldLabel}>Customer name</span>
                      <span className={styles.fieldValue}>{order.customer_name}</span>
                    </span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldIcon}>
                      <Phone size={15} />
                    </span>
                    <span className={styles.fieldBody}>
                      <span className={styles.fieldLabel}>Phone number</span>
                      <span className={styles.fieldValue}>{order.customer_phone}</span>
                    </span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldIcon}>
                      <MapPin size={15} />
                    </span>
                    <span className={styles.fieldBody}>
                      <span className={styles.fieldLabel}>Wilaya / commune</span>
                      <span className={styles.fieldValue}>
                        {order.wilaya}
                        {order.city ? ` · ${order.city}` : ""}
                      </span>
                    </span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldIcon}>
                      <Truck size={15} />
                    </span>
                    <span className={styles.fieldBody}>
                      <span className={styles.fieldLabel}>Delivery</span>
                      <span className={styles.fieldValue}>
                        {order.delivery_type === "home" ? "Home delivery" : "Stop desk"}
                      </span>
                    </span>
                  </div>
                </div>
              </section>

              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Items</h3>
                  <span className={styles.itemCount}>
                    {items.length} {items.length === 1 ? "product" : "products"} · {itemCount} units
                  </span>
                </div>

                <div className={styles.itemsList}>
                  {items.length > 0 ? (
                    items.map((item, index) => (
                      <div key={index} className={styles.itemCard}>
                        <span className={styles.itemIndex}>
                          <Package size={16} />
                        </span>
                        <div className={styles.itemBody}>
                          <div className={styles.itemTop}>
                            <span className={styles.itemName}>{item.product_name_snapshot}</span>
                            <span className={styles.itemPrice}>
                              {money(Number(item.unit_price_at_purchase) * Number(item.quantity))}
                            </span>
                          </div>
                          <div className={styles.itemMeta}>
                            <span className={styles.qtyChip}>× {item.quantity}</span>
                            <span>{money(item.unit_price_at_purchase)} each</span>
                            {item.color && <span>Color: {item.color}</span>}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={styles.noItems}>No items recorded for this order.</p>
                  )}
                </div>
              </section>
            </div>

            <footer className={styles.summary}>
              <div className={styles.summaryRow}>
                <span>Products total</span>
                <strong>{money(order.products_total)}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <strong>{money(order.shipping_cost)}</strong>
              </div>
              <div className={`${styles.summaryRow} ${styles.grandTotal}`}>
                <span>Grand total</span>
                <strong>{money(order.grand_total)}</strong>
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

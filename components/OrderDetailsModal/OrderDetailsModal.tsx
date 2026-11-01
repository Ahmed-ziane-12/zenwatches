"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./OrderDetailsModal.module.css";

interface OrderDetailsModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  if (!order) return null;

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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>Order #{order.id} Details</h2>
              <button className={styles.closeButton} onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.content}>
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Order Information</h3>
                <div className={styles.grid}>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Customer Name</span>
                    <span className={styles.fieldValue}>{order.customer_name}</span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Phone Number</span>
                    <span className={styles.fieldValue}>{order.customer_phone}</span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Wilaya</span>
                    <span className={styles.fieldValue}>{order.wilaya}</span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>City/Commune</span>
                    <span className={styles.fieldValue}>{order.city || "-"}</span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Delivery Type</span>
                    <span className={styles.fieldValue}>{order.delivery_type === "home" ? "Home Delivery" : "Stop Desk"}</span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Status</span>
                    <span className={styles.fieldValue}>{order.status}</span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Products Total</span>
                    <span className={styles.fieldValue}>{order.products_total} DA</span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Shipping Cost</span>
                    <span className={styles.fieldValue}>{order.shipping_cost} DA</span>
                  </div>
                  <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                    <span className={styles.fieldLabel}>Grand Total</span>
                    <span className={styles.fieldValue} style={{ fontWeight: "600", fontSize: "1.1rem" }}>{order.grand_total} DA</span>
                  </div>
                </div>
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Order Items</h3>
                <div className={styles.itemsList}>
                  {order.order_items && order.order_items.length > 0 ? (
                    order.order_items.map((item: any, idx: number) => (
                      <div key={idx} className={styles.itemCard}>
                        <div className={styles.itemHeader}>
                          <span className={styles.itemName}>{item.product_name_snapshot}</span>
                          <span className={styles.itemPrice}>{item.unit_price_at_purchase} DA</span>
                        </div>
                        <div className={styles.itemDetails}>
                          <div className={styles.itemDetail}>
                            <span className={styles.itemDetailLabel}>Quantity</span>
                            <span className={styles.itemDetailValue}>{item.quantity}</span>
                          </div>
                          {item.color && (
                            <div className={styles.itemDetail}>
                              <span className={styles.itemDetailLabel}>Color</span>
                              <span className={styles.itemDetailValue}>{item.color}</span>
                            </div>
                          )}
                          <div className={styles.itemDetail}>
                            <span className={styles.itemDetailLabel}>Subtotal</span>
                            <span className={styles.itemDetailValue}>{(item.unit_price_at_purchase * item.quantity).toLocaleString()} DA</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "var(--muted)", textAlign: "center", padding: "1rem" }}>No items</p>
                  )}
                </div>
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

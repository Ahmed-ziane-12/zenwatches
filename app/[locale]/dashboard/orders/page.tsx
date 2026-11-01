"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Trash2 } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";
import OrderDetailsModal from "@/components/OrderDetailsModal/OrderDetailsModal";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/dashboard/orders");
      const data = await response.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: number, status: string) => {
    try {
      const response = await fetch("/api/dashboard/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const deleteOrder = async (orderId: number) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      const response = await fetch(`/api/dashboard/orders?orderId=${orderId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const openOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <LoadingSpinner size={32} text="Loading orders..." />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
        <ShoppingCart size={28} style={{ color: "var(--text)" }} />
        <h1 style={{ fontSize: "1.8rem", color: "var(--text)", fontWeight: "600" }}>Orders</h1>
        <span style={{ padding: "0.25rem 0.75rem", background: "var(--card)", border: "1px solid var(--line)", borderRadius: "20px", color: "var(--muted)", fontSize: "0.875rem" }}>{orders.length}</span>
      </div>
      <div style={{ background: "var(--card)", borderRadius: "12px", border: "1px solid var(--line)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--line)" }}>
                <th style={{ padding: "0.875rem 1rem", textAlign: "left", color: "var(--text)", fontWeight: "500", fontSize: "0.875rem" }}>ID</th>
                <th style={{ padding: "0.875rem 1rem", textAlign: "left", color: "var(--text)", fontWeight: "500", fontSize: "0.875rem" }}>Customer</th>
                <th style={{ padding: "0.875rem 1rem", textAlign: "left", color: "var(--text)", fontWeight: "500", fontSize: "0.875rem" }}>Phone</th>
                <th style={{ padding: "0.875rem 1rem", textAlign: "left", color: "var(--text)", fontWeight: "500", fontSize: "0.875rem" }}>Total</th>
                <th style={{ padding: "0.875rem 1rem", textAlign: "left", color: "var(--text)", fontWeight: "500", fontSize: "0.875rem" }}>Status</th>
                <th style={{ padding: "0.875rem 1rem", textAlign: "left", color: "var(--text)", fontWeight: "500", fontSize: "0.875rem" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr 
                  key={order.id} 
                  style={{ borderBottom: "1px solid var(--line)", transition: "background 0.15s", cursor: "pointer" }} 
                  onClick={() => openOrderDetails(order)}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg)"} 
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "0.875rem 1rem", color: "var(--text)", fontWeight: "500" }}>#{order.id}</td>
                  <td style={{ padding: "0.875rem 1rem", color: "var(--text)" }}>{order.customer_name}</td>
                  <td style={{ padding: "0.875rem 1rem", color: "var(--text)" }}>{order.customer_phone}</td>
                  <td style={{ padding: "0.875rem 1rem", color: "var(--text)", fontWeight: "500" }}>{order.grand_total} DA</td>
                  <td style={{ padding: "0.875rem 1rem" }} onClick={(e) => e.stopPropagation()}>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      style={{ padding: "0.375rem 0.625rem", background: "var(--bg)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: "6px", fontSize: "0.875rem", cursor: "pointer" }}
                    >
                      <option value="new">New</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={{ padding: "0.875rem 1rem" }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => deleteOrder(order.id)}
                      style={{ padding: "0.375rem 0.625rem", background: "transparent", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem" }}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard, ShoppingCart, DollarSign, Clock, CheckCircle, Hourglass } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <LoadingSpinner size={32} text="Loading stats..." />
      </div>
    );
  }

  const statCards = [
    { title: "Total Orders", value: stats?.totalOrders || 0, icon: ShoppingCart, color: "#3b82f6" },
    { title: "Revenue (Delivered)", value: `${(stats?.totalRevenue || 0).toLocaleString()} DA`, icon: DollarSign, color: "#10b981" },
    { title: "Pending Revenue", value: `${(stats?.pendingRevenue || 0).toLocaleString()} DA`, icon: Hourglass, color: "#f59e0b" },
    { title: "New Orders", value: stats?.newOrders || 0, icon: Clock, color: "#8b5cf6" },
    { title: "Delivered", value: stats?.deliveredOrders || 0, icon: CheckCircle, color: "#06b6d4" },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
        <LayoutDashboard size={28} style={{ color: "var(--text)" }} />
        <h1 style={{ fontSize: "1.8rem", color: "var(--text)", fontWeight: "600" }}>Overview</h1>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {statCards.map((card, idx) => (
          <div key={idx} style={{ background: "var(--card)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--line)", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "10px", background: `${card.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <card.icon size={24} style={{ color: card.color }} />
            </div>
            <div>
              <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginBottom: "0.25rem" }}>{card.title}</p>
              <p style={{ color: "var(--text)", fontSize: "1.5rem", fontWeight: "600" }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "var(--card)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--line)" }}>
        <h2 style={{ fontSize: "1.3rem", color: "var(--text)", fontWeight: "600", marginBottom: "1.5rem" }}>Orders by Status</h2>
        {stats?.chartData && stats.chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.chartData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted)" }}>No orders yet</div>
        )}
      </div>
    </div>
  );
}

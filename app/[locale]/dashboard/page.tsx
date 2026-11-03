"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  Hourglass,
  LayoutDashboard,
  PackageCheck,
  PackageOpen,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  Timer,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useAuth } from "@/components/AuthProvider/AuthProvider";
import styles from "./overview.module.css";

interface ChartSlice {
  name: string;
  value: number;
  fill: string;
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  pendingRevenue: number;
  newOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  chartData: ChartSlice[];
}

function formatMoney(value: number) {
  return `${Math.round(value || 0).toLocaleString()} DA`;
}

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const slice = payload[0];
  return (
    <div className={styles.tooltip}>
      <span
        className={styles.tooltipDot}
        style={{ background: slice.payload?.fill }}
      />
      <span>{slice.name}</span>
      <strong>{slice.value}</strong>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [today, setToday] = useState("");

  const fetchStats = useCallback(async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "refresh") setRefreshing(true);
    try {
      const response = await fetch("/api/dashboard/stats", { cache: "no-store" });
      if (!response.ok) throw new Error("Request failed");
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Could not load dashboard stats.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    setToday(
      new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    );
  }, []);

  const totalOrders = stats?.totalOrders ?? 0;
  const deliveredOrders = stats?.deliveredOrders ?? 0;
  const cancelledOrders = stats?.cancelledOrders ?? 0;
  const pendingOrders =
    (stats?.newOrders ?? 0) + (stats?.processingOrders ?? 0) + (stats?.shippedOrders ?? 0);
  const deliveryRate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;
  const cancellationRate = totalOrders > 0 ? Math.round((cancelledOrders / totalOrders) * 100) : 0;
  const chartData = stats?.chartData ?? [];

  const statCards = [
    {
      label: "Total orders",
      value: totalOrders.toLocaleString(),
      hint: "All time",
      icon: ShoppingCart,
      tone: styles.blue,
    },
    {
      label: "Delivered revenue",
      value: formatMoney(stats?.totalRevenue ?? 0),
      hint: "Paid on delivery",
      icon: Banknote,
      tone: styles.green,
    },
    {
      label: "Pending revenue",
      value: formatMoney(stats?.pendingRevenue ?? 0),
      hint: "Awaiting completion",
      icon: Hourglass,
      tone: styles.amber,
    },
    {
      label: "New orders",
      value: (stats?.newOrders ?? 0).toLocaleString(),
      hint: "Needs attention",
      icon: Sparkles,
      tone: styles.violet,
    },
    {
      label: "Delivered",
      value: deliveredOrders.toLocaleString(),
      hint: `${deliveryRate}% of orders`,
      icon: PackageCheck,
      tone: styles.cyan,
    },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.headIcon}>
            <LayoutDashboard size={24} />
          </span>
          <div>
            <h1 className={styles.title}>Overview</h1>
            <p className={styles.subtitle}>
              Welcome back{user?.username ? `, ${user.username}` : ""}
              {today ? ` · ${today}` : ""}
            </p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.ghostButton}
            onClick={() => fetchStats("refresh")}
            disabled={refreshing}
          >
            <RefreshCw size={15} className={refreshing ? styles.spin : ""} />
            <span>{refreshing ? "Refreshing" : "Refresh"}</span>
          </button>
        </div>
      </header>

      {loading ? (
        <>
          <div className={styles.stats}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.statSkeleton} />
            ))}
          </div>
          <div className={styles.panels}>
            <div className={styles.cardSkeleton} />
            <div className={styles.cardSkeleton} />
          </div>
        </>
      ) : error ? (
        <div className={styles.card}>
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>
              <AlertTriangle size={26} />
            </span>
            <h2 className={styles.emptyTitle}>{error}</h2>
            <p className={styles.emptyText}>Please try again in a moment.</p>
            <button
              type="button"
              className={styles.ghostButton}
              onClick={() => fetchStats("refresh")}
            >
              <RefreshCw size={15} />
              <span>Retry</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.stats}>
            {statCards.map((card) => (
              <article key={card.label} className={`${styles.statCard} ${card.tone}`}>
                <div className={styles.statTop}>
                  <span className={styles.statIcon}>
                    <card.icon size={20} />
                  </span>
                </div>
                <p className={styles.statLabel}>{card.label}</p>
                <p className={styles.statValue}>{card.value}</p>
                <p className={styles.statHint}>{card.hint}</p>
              </article>
            ))}
          </div>

          <div className={styles.panels}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>Orders by status</h2>
                  <p className={styles.cardSubtitle}>Distribution across every order</p>
                </div>
                <span className={styles.chip}>{totalOrders} total</span>
              </div>

              {chartData.length > 0 ? (
                <>
                  <div className={styles.chartWrap}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={68}
                          outerRadius={104}
                          paddingAngle={3}
                          cornerRadius={6}
                          stroke="none"
                        >
                          {chartData.map((entry) => (
                            <Cell key={entry.name} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className={styles.donutCenter}>
                      <strong>{totalOrders}</strong>
                      <span>orders</span>
                    </div>
                  </div>

                  <ul className={styles.legend}>
                    {chartData.map((entry) => (
                      <li key={entry.name} className={styles.legendItem}>
                        <span
                          className={styles.legendDot}
                          style={{ background: entry.fill }}
                        />
                        {entry.name}
                        <span className={styles.legendCount}>{entry.value}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className={styles.empty}>
                  <span className={styles.emptyIcon}>
                    <PackageOpen size={26} />
                  </span>
                  <h3 className={styles.emptyTitle}>No orders yet</h3>
                  <p className={styles.emptyText}>
                    New orders will appear here as soon as they arrive.
                  </p>
                </div>
              )}
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>At a glance</h2>
                  <p className={styles.cardSubtitle}>Health of your order pipeline</p>
                </div>
              </div>

              <div className={styles.metricList}>
                <div>
                  <div className={styles.metricTop}>
                    <span>Delivery rate</span>
                    <strong>{deliveryRate}%</strong>
                  </div>
                  <div className={styles.track}>
                    <span
                      className={`${styles.fill} ${styles.fillGreen}`}
                      style={{ width: `${deliveryRate}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className={styles.metricTop}>
                    <span>Cancellation rate</span>
                    <strong>{cancellationRate}%</strong>
                  </div>
                  <div className={styles.track}>
                    <span
                      className={`${styles.fill} ${styles.fillRed}`}
                      style={{ width: `${cancellationRate}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className={styles.metricTop}>
                    <span>Pending orders</span>
                    <strong>{pendingOrders}</strong>
                  </div>
                  <div className={styles.track}>
                    <span
                      className={styles.fill}
                      style={{
                        width: `${totalOrders > 0 ? Math.round((pendingOrders / totalOrders) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.miniGrid}>
                <div className={styles.miniCard}>
                  <span>Avg. delivered order</span>
                  <strong>{formatMoney(stats?.averageOrderValue ?? 0)}</strong>
                </div>
                <div className={styles.miniCard}>
                  <span>In progress</span>
                  <strong>{(stats?.processingOrders ?? 0) + (stats?.shippedOrders ?? 0)}</strong>
                </div>
                <div className={styles.miniCard}>
                  <span>Awaiting pickup</span>
                  <strong>{stats?.newOrders ?? 0}</strong>
                </div>
                <div className={styles.miniCard}>
                  <span>Cancelled</span>
                  <strong>{cancelledOrders}</strong>
                </div>
              </div>

              <div className={styles.tip}>
                <Timer size={15} />
                <span>Keep new orders under 24h to improve your delivery rate.</span>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

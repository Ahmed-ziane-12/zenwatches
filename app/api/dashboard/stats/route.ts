import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabase();
    
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*");

    if (error) {
      console.error("[api/dashboard/stats]", error);
      return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }

    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.filter(o => o.status === "delivered").reduce((sum, order) => sum + (Number(order.grand_total) || 0), 0) || 0;
    const pendingRevenue = orders?.filter(o => o.status !== "delivered" && o.status !== "cancelled").reduce((sum, order) => sum + (Number(order.grand_total) || 0), 0) || 0;
    const newOrders = orders?.filter(o => o.status === "new").length || 0;
    const deliveredOrders = orders?.filter(o => o.status === "delivered").length || 0;

    // Group by status for chart
    const statusCounts = orders?.reduce((acc: any, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const chartData = [
      { name: "New", value: statusCounts?.new || 0, fill: "#3b82f6" },
      { name: "Processing", value: statusCounts?.processing || 0, fill: "#f59e0b" },
      { name: "Shipped", value: statusCounts?.shipped || 0, fill: "#8b5cf6" },
      { name: "Delivered", value: statusCounts?.delivered || 0, fill: "#10b981" },
      { name: "Cancelled", value: statusCounts?.cancelled || 0, fill: "#ef4444" },
    ].filter(item => item.value > 0);

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      pendingRevenue,
      newOrders,
      deliveredOrders,
      chartData
    }, { status: 200 });
  } catch (error: any) {
    console.error("[api/dashboard/stats]", error);
    return NextResponse.json({ error: "Could not fetch stats" }, { status: 500 });
  }
}

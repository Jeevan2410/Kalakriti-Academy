import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// Admin stats endpoint — view total revenue, users, orders, enrollments
export async function GET() {
  try {
    const [totalUsers, totalOrders, totalProducts, totalEnrollments] = await Promise.all([
      db.user.count(),
      db.order.count(),
      db.product.count(),
      db.enrollment.count(),
    ]);

    // Calculate total revenue
    const revenueResult = await db.order.aggregate({
      where: { paymentStatus: "completed" },
      _sum: { totalAmount: true },
    });

    // Get recent orders
    const recentOrders = await db.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    // Get top courses by enrollment count
    const topCourses = await db.product.findMany({
      take: 5,
      orderBy: { students: "desc" },
      select: { id: true, title: true, students: true, price: true, rating: true },
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalEnrollments,
        totalRevenue: revenueResult._sum.totalAmount || 0,
      },
      recentOrders,
      topCourses,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
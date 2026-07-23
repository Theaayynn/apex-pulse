import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";

export async function GET() {
  const { error, status } = await requireAdminApi();
  if (error) return NextResponse.json({ error }, { status });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsers30d,
    totalOrders,
    paidOrders,
    revenueAgg,
    openTickets,
    totalLeads,
    newLeads30d,
    subscribers,
    recentOrders,
    ordersForChart,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    prisma.supportTicket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.newsletterSubscriber.count({ where: { isSubscribed: true } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { name: true, email: true } }, plan: true },
    }),
    prisma.order.findMany({
      where: { status: "PAID", createdAt: { gte: sixMonthsAgo } },
      select: { amount: true, createdAt: true },
    }),
  ]);

  // Bucket revenue by month for the chart (last 6 months).
  const monthly: Record<string, number> = {};
  for (const o of ordersForChart) {
    const key = o.createdAt.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    monthly[key] = (monthly[key] ?? 0) + o.amount;
  }

  return NextResponse.json({
    totalUsers,
    newUsers30d,
    totalOrders,
    paidOrders,
    totalRevenue: revenueAgg._sum.amount ?? 0,
    openTickets,
    totalLeads,
    newLeads30d,
    subscribers,
    recentOrders,
    revenueByMonth: Object.entries(monthly).map(([month, amount]) => ({ month, amount })),
  });
}

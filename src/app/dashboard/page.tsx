import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import GlassCard from "@/components/GlassCard";
import Reveal from "@/components/Reveal";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";
import { ShoppingBag, Receipt, LifeBuoy, Bell, ShieldCheck, ShieldAlert } from "lucide-react";

export default async function DashboardOverviewPage() {
  const user = await requireUser();

  const [orderCount, invoiceCount, openTickets, unreadNotifications, recentOrders] = await Promise.all([
    prisma.order.count({ where: { userId: user.id } }),
    prisma.invoice.count({ where: { userId: user.id } }),
    prisma.supportTicket.count({ where: { userId: user.id, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.notification.count({ where: { userId: user.id, isRead: false } }),
    prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5, include: { plan: true } }),
  ]);

  const stats = [
    { label: "Orders", value: orderCount, icon: ShoppingBag, href: "/dashboard/orders" },
    { label: "Invoices", value: invoiceCount, icon: Receipt, href: "/dashboard/invoices" },
    { label: "Open tickets", value: openTickets, icon: LifeBuoy, href: "/dashboard/support" },
    { label: "Unread alerts", value: unreadNotifications, icon: Bell, href: "/dashboard/notifications" },
  ];

  return (
    <div>
      <Reveal>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user.name.split(" ")[0]}</h1>
            <p className="mt-1 text-sm text-foreground/50">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            {user.isEmailVerified ? (
              <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-accent-glow">
                <ShieldCheck size={14} /> Verified
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-xs text-yellow-400">
                <ShieldAlert size={14} /> Unverified
              </span>
            )}
            <LogoutButton />
          </div>
        </div>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06}>
            <Link href={s.href}>
              <GlassCard className="h-full">
                <s.icon className="mb-3 text-accent-soft" size={20} />
                <p className="text-2xl font-semibold">{s.value}</p>
                <p className="text-xs text-foreground/50">{s.label}</p>
              </GlassCard>
            </Link>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2} className="mt-8">
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-medium">Recent orders</h2>
            <Link href="/dashboard/orders" className="text-xs text-accent-soft hover:underline">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-foreground/50">
              No orders yet.{" "}
              <Link href="/pricing" className="text-accent-soft hover:underline">
                Browse plans
              </Link>
              .
            </p>
          ) : (
            <div className="divide-y divide-border">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">{order.plan?.name ?? "Custom order"}</p>
                    <p className="text-xs text-foreground/40">{order.createdAt.toLocaleDateString()}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      order.status === "PAID"
                        ? "bg-accent-glow/15 text-accent-glow"
                        : order.status === "PENDING"
                        ? "bg-yellow-500/15 text-yellow-400"
                        : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </Reveal>
    </div>
  );
}

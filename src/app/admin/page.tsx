"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import GlassCard from "@/components/GlassCard";
import Reveal from "@/components/Reveal";
import { Users, TrendingUp, ShoppingBag, LifeBuoy, UserPlus, Mail } from "lucide-react";

interface Stats {
  totalUsers: number;
  newUsers30d: number;
  totalOrders: number;
  paidOrders: number;
  totalRevenue: number;
  openTickets: number;
  totalLeads: number;
  newLeads30d: number;
  subscribers: number;
  recentOrders: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    user: { name: string; email: string };
    plan: { name: string } | null;
  }>;
  revenueByMonth: Array<{ month: string; amount: number }>;
}

function formatCurrency(paise: number) {
  return `₹${(paise / 100).toLocaleString()}`;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then(setStats);
  }, []);

  if (!stats) return <p className="text-sm text-foreground/50">Loading analytics…</p>;

  const cards = [
    { label: "Total revenue", value: formatCurrency(stats.totalRevenue), icon: TrendingUp, sub: `${stats.paidOrders} paid orders` },
    { label: "Total users", value: stats.totalUsers, icon: Users, sub: `+${stats.newUsers30d} in 30 days` },
    { label: "Total orders", value: stats.totalOrders, icon: ShoppingBag, sub: `${stats.paidOrders} paid` },
    { label: "Open tickets", value: stats.openTickets, icon: LifeBuoy, sub: "Needs attention" },
    { label: "Leads", value: stats.totalLeads, icon: UserPlus, sub: `+${stats.newLeads30d} in 30 days` },
    { label: "Newsletter subs", value: stats.subscribers, icon: Mail, sub: "Active subscribers" },
  ];

  return (
    <div>
      <Reveal>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Dashboard</h1>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => (
          <Reveal key={c.label} delay={i * 0.05}>
            <GlassCard>
              <c.icon className="mb-3 text-accent-soft" size={18} />
              <p className="text-2xl font-semibold">{c.value}</p>
              <p className="text-xs text-foreground/50">{c.label}</p>
              <p className="mt-1 text-xs text-foreground/35">{c.sub}</p>
            </GlassCard>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2} className="mt-6">
        <GlassCard>
          <h2 className="mb-4 text-base font-medium">Revenue — last 6 months</h2>
          {stats.revenueByMonth.length === 0 ? (
            <p className="py-10 text-center text-sm text-foreground/50">No paid orders in this period yet.</p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fill: "rgba(245,245,247,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                    tick={{ fill: "rgba(245,245,247,0.5)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(v: number) => formatCurrency(v)}
                    contentStyle={{ background: "#0A0A12", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}
                  />
                  <Bar dataKey="amount" fill="#7C5CFF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </GlassCard>
      </Reveal>

      <Reveal delay={0.25} className="mt-6">
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-medium">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs text-accent-soft hover:underline">
              View all
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-foreground/50">No orders yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {stats.recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">{o.user.name}</p>
                    <p className="text-xs text-foreground/40">{o.plan?.name ?? "Custom"} · {o.user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(o.amount)}</p>
                    <p className="text-xs text-foreground/40">{o.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </Reveal>
    </div>
  );
}

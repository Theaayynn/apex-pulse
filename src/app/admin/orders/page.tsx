"use client";

import { useEffect, useState, useCallback } from "react";
import GlassCard from "@/components/GlassCard";
import Reveal from "@/components/Reveal";
import AdminTable, { type Column } from "@/components/AdminTable";

interface AdminOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
  gateway: string | null;
  createdAt: string;
  user: { name: string; email: string };
  plan: { name: string } | null;
  invoice: { invoiceNumber: string } | null;
}

const STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED", "CANCELLED"];

const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-accent-glow/15 text-accent-glow",
  PENDING: "bg-yellow-500/15 text-yellow-400",
  FAILED: "bg-red-500/15 text-red-400",
  REFUNDED: "bg-white/10 text-foreground/50",
  CANCELLED: "bg-white/10 text-foreground/40",
};

function formatAmount(paise: number, currency: string) {
  const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency + " ";
  return `${symbol}${(paise / 100).toLocaleString()}`;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/orders?${params}`);
    const json = await res.json();
    setOrders(json.orders ?? []);
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: Column<AdminOrder>[] = [
    {
      header: "Customer",
      render: (o) => (
        <div>
          <p className="font-medium">{o.user.name}</p>
          <p className="text-xs text-foreground/40">{o.user.email}</p>
        </div>
      ),
    },
    { header: "Plan", render: (o) => o.plan?.name ?? "Custom" },
    { header: "Amount", render: (o) => formatAmount(o.amount, o.currency) },
    { header: "Gateway", render: (o) => o.gateway ?? "—" },
    { header: "Invoice", render: (o) => o.invoice?.invoiceNumber ?? "—" },
    {
      header: "Status",
      render: (o) => <span className={`rounded-full px-2.5 py-1 text-xs ${STATUS_STYLES[o.status]}`}>{o.status}</span>,
    },
    { header: "Date", render: (o) => new Date(o.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <Reveal>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Orders</h1>
      </Reveal>

      <Reveal delay={0.05}>
        <GlassCard className="mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </GlassCard>
      </Reveal>

      <Reveal delay={0.1}>
        {orders === null ? (
          <p className="text-sm text-foreground/50">Loading…</p>
        ) : (
          <AdminTable columns={columns} rows={orders} keyField={(o) => o.id} emptyMessage="No orders found." />
        )}
      </Reveal>
    </div>
  );
}

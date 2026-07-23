"use client";

import { useEffect, useState, useCallback } from "react";
import GlassCard from "@/components/GlassCard";
import Reveal from "@/components/Reveal";
import AdminTable, { type Column } from "@/components/AdminTable";

interface AdminInvoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  issuedAt: string;
  dueAt: string | null;
  pdfUrl: string | null;
  user: { name: string; email: string };
}

const STATUSES = ["DRAFT", "SENT", "PAID", "OVERDUE", "VOID"];

const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-accent-glow/15 text-accent-glow",
  SENT: "bg-yellow-500/15 text-yellow-400",
  OVERDUE: "bg-red-500/15 text-red-400",
  DRAFT: "bg-white/10 text-foreground/50",
  VOID: "bg-white/10 text-foreground/40",
};

function formatAmount(paise: number, currency: string) {
  const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency + " ";
  return `${symbol}${(paise / 100).toLocaleString()}`;
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<AdminInvoice[] | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/invoices?${params}`);
    const json = await res.json();
    setInvoices(json.invoices ?? []);
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: Column<AdminInvoice>[] = [
    { header: "Invoice #", render: (i) => i.invoiceNumber },
    {
      header: "Customer",
      render: (i) => (
        <div>
          <p className="font-medium">{i.user.name}</p>
          <p className="text-xs text-foreground/40">{i.user.email}</p>
        </div>
      ),
    },
    { header: "Amount", render: (i) => formatAmount(i.amount, i.currency) },
    {
      header: "Status",
      render: (i) => <span className={`rounded-full px-2.5 py-1 text-xs ${STATUS_STYLES[i.status]}`}>{i.status}</span>,
    },
    { header: "Issued", render: (i) => new Date(i.issuedAt).toLocaleDateString() },
    { header: "Due", render: (i) => (i.dueAt ? new Date(i.dueAt).toLocaleDateString() : "—") },
  ];

  return (
    <div>
      <Reveal>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Invoices</h1>
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
        {invoices === null ? (
          <p className="text-sm text-foreground/50">Loading…</p>
        ) : (
          <AdminTable columns={columns} rows={invoices} keyField={(i) => i.id} emptyMessage="No invoices found." />
        )}
      </Reveal>
    </div>
  );
}

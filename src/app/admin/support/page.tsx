"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import Reveal from "@/components/Reveal";
import AdminTable, { type Column } from "@/components/AdminTable";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  updatedAt: string;
  user: { name: string; email: string };
  assignee: { name: string } | null;
  _count: { messages: number };
}

const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-yellow-500/15 text-yellow-400",
  IN_PROGRESS: "bg-accent/15 text-accent-soft",
  RESOLVED: "bg-accent-glow/15 text-accent-glow",
  CLOSED: "bg-white/10 text-foreground/40",
};

const PRIORITY_STYLES: Record<string, string> = {
  LOW: "text-foreground/40",
  MEDIUM: "text-foreground/60",
  HIGH: "text-yellow-400",
  URGENT: "text-red-400",
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/support?${params}`);
    const json = await res.json();
    setTickets(json.tickets ?? []);
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const columns: Column<Ticket>[] = [
    {
      header: "Subject",
      render: (t) => (
        <Link href={`/admin/support/${t.id}`} className="font-medium hover:text-accent-soft">
          {t.subject}
        </Link>
      ),
    },
    { header: "Customer", render: (t) => <div><p>{t.user.name}</p><p className="text-xs text-foreground/40">{t.user.email}</p></div> },
    { header: "Assignee", render: (t) => t.assignee?.name ?? <span className="text-foreground/30">Unassigned</span> },
    { header: "Priority", render: (t) => <span className={PRIORITY_STYLES[t.priority]}>{t.priority}</span> },
    { header: "Status", render: (t) => <span className={`rounded-full px-2.5 py-1 text-xs ${STATUS_STYLES[t.status]}`}>{t.status.replace("_", " ")}</span> },
    { header: "Messages", render: (t) => t._count.messages },
    { header: "Updated", render: (t) => new Date(t.updatedAt).toLocaleDateString() },
  ];

  return (
    <div>
      <Reveal>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Support Tickets</h1>
      </Reveal>

      <Reveal delay={0.05}>
        <GlassCard className="mb-4">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent">
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
        </GlassCard>
      </Reveal>

      <Reveal delay={0.1}>
        {tickets === null ? <p className="text-sm text-foreground/50">Loading…</p> : (
          <AdminTable columns={columns} rows={tickets} keyField={(t) => t.id} emptyMessage="No tickets match your filters." />
        )}
      </Reveal>
    </div>
  );
}

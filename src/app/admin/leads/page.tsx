"use client";

import { useEffect, useState, useCallback } from "react";
import GlassCard from "@/components/GlassCard";
import Reveal from "@/components/Reveal";
import AdminTable, { type Column } from "@/components/AdminTable";

interface Lead {
  id: string;
  formType: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  createdAt: string;
}

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "LOST", "CONVERTED"];
const FORM_TYPES = ["contact", "callback", "feedback", "lead", "complaint"];

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-accent/15 text-accent-soft",
  CONTACTED: "bg-yellow-500/15 text-yellow-400",
  QUALIFIED: "bg-accent-glow/15 text-accent-glow",
  LOST: "bg-red-500/15 text-red-400",
  CONVERTED: "bg-white/15 text-white",
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (typeFilter) params.set("formType", typeFilter);
    const res = await fetch(`/api/admin/leads?${params}`);
    const json = await res.json();
    setLeads(json.leads ?? []);
  }, [statusFilter, typeFilter]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, newStatus: string) {
    await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    load();
  }

  const columns: Column<Lead>[] = [
    { header: "Name", render: (l) => <div><p className="font-medium">{l.name}</p><p className="text-xs text-foreground/40">{l.email}</p></div> },
    { header: "Type", render: (l) => <span className="rounded-full border border-border px-2 py-0.5 text-xs capitalize">{l.formType}</span> },
    { header: "Message", render: (l) => <span className="line-clamp-2 max-w-xs text-xs text-foreground/60">{l.message}</span> },
    {
      header: "Status",
      render: (l) => (
        <select
          value={l.status}
          onChange={(e) => updateStatus(l.id, e.target.value)}
          className={`rounded-full border-0 px-2.5 py-1 text-xs outline-none ${STATUS_STYLES[l.status]}`}
        >
          {STATUSES.map((s) => <option key={s} value={s} className="bg-background text-foreground">{s}</option>)}
        </select>
      ),
    },
    { header: "Date", render: (l) => new Date(l.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <Reveal>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Leads</h1>
      </Reveal>

      <Reveal delay={0.05}>
        <GlassCard className="mb-4 flex flex-wrap gap-3">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent">
            <option value="">All form types</option>
            {FORM_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent">
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </GlassCard>
      </Reveal>

      <Reveal delay={0.1}>
        {leads === null ? <p className="text-sm text-foreground/50">Loading…</p> : (
          <AdminTable columns={columns} rows={leads} keyField={(l) => l.id} emptyMessage="No leads match your filters." />
        )}
      </Reveal>
    </div>
  );
}

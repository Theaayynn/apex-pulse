"use client";

import { useEffect, useState, useCallback } from "react";
import Reveal from "@/components/Reveal";
import AdminTable, { type Column } from "@/components/AdminTable";
import { Download } from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  isSubscribed: boolean;
  createdAt: string;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[] | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/newsletter");
    const json = await res.json();
    setSubscribers(json.subscribers ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  function exportCsv() {
    if (!subscribers) return;
    const rows = [["email", "subscribed", "joined"], ...subscribers.map((s) => [s.email, String(s.isSubscribed), s.createdAt])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const columns: Column<Subscriber>[] = [
    { header: "Email", render: (s) => s.email },
    { header: "Status", render: (s) => <span className={s.isSubscribed ? "text-accent-glow" : "text-foreground/40"}>{s.isSubscribed ? "Subscribed" : "Unsubscribed"}</span> },
    { header: "Joined", render: (s) => new Date(s.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <Reveal>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Newsletter</h1>
          <button onClick={exportCsv} className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm hover:border-accent/40">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </Reveal>
      <Reveal delay={0.05}>
        {subscribers === null ? <p className="text-sm text-foreground/50">Loading…</p> : (
          <AdminTable columns={columns} rows={subscribers} keyField={(s) => s.id} emptyMessage="No subscribers yet." />
        )}
      </Reveal>
    </div>
  );
}

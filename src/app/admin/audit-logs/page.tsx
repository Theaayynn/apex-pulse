"use client";

import { useEffect, useState, useCallback } from "react";
import Reveal from "@/components/Reveal";
import AdminTable, { type Column } from "@/components/AdminTable";

interface AuditLog {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  ipAddress: string | null;
  createdAt: string;
  user: { name: string; email: string } | null;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/audit-logs?page=${page}`);
    const json = await res.json();
    setLogs(json.logs ?? []);
    setTotalPages(json.pagination?.totalPages ?? 1);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const columns: Column<AuditLog>[] = [
    { header: "Action", render: (l) => <span className="font-mono text-xs">{l.action}</span> },
    { header: "By", render: (l) => l.user ? <div><p>{l.user.name}</p><p className="text-xs text-foreground/40">{l.user.email}</p></div> : <span className="text-foreground/30">System</span> },
    { header: "Entity", render: (l) => l.entityType ? `${l.entityType} · ${l.entityId?.slice(0, 8)}…` : "—" },
    { header: "IP", render: (l) => l.ipAddress ?? "—" },
    { header: "When", render: (l) => new Date(l.createdAt).toLocaleString() },
  ];

  return (
    <div>
      <Reveal>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Audit Logs</h1>
      </Reveal>

      <Reveal delay={0.05}>
        {logs === null ? <p className="text-sm text-foreground/50">Loading…</p> : (
          <AdminTable columns={columns} rows={logs} keyField={(l) => l.id} emptyMessage="No audit log entries yet." />
        )}
      </Reveal>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-30">
            Previous
          </button>
          <span className="px-3 py-1.5 text-sm text-foreground/50">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-30">
            Next
          </button>
        </div>
      )}
    </div>
  );
}

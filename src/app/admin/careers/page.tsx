"use client";

import { useEffect, useState, useCallback } from "react";
import Reveal from "@/components/Reveal";
import AdminTable, { type Column } from "@/components/AdminTable";
import { ExternalLink } from "lucide-react";

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  position: string;
  resumeUrl: string;
  coverLetter: string | null;
  createdAt: string;
}

export default function AdminCareersPage() {
  const [applications, setApplications] = useState<Application[] | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/careers");
    const json = await res.json();
    setApplications(json.applications ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns: Column<Application>[] = [
    { header: "Applicant", render: (a) => <div><p className="font-medium">{a.fullName}</p><p className="text-xs text-foreground/40">{a.email}</p></div> },
    { header: "Position", render: (a) => a.position },
    { header: "Phone", render: (a) => a.phone ?? "—" },
    {
      header: "Resume",
      render: (a) => (
        <a href={a.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-accent-soft hover:underline">
          View <ExternalLink size={12} />
        </a>
      ),
    },
    { header: "Applied", render: (a) => new Date(a.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <Reveal>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Career Applications</h1>
      </Reveal>
      <Reveal delay={0.05}>
        {applications === null ? <p className="text-sm text-foreground/50">Loading…</p> : (
          <AdminTable columns={columns} rows={applications} keyField={(a) => a.id} emptyMessage="No applications yet." />
        )}
      </Reveal>
    </div>
  );
}

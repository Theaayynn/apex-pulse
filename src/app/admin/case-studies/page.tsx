"use client";

import { useEffect, useState, useCallback } from "react";
import Reveal from "@/components/Reveal";
import AdminTable, { type Column } from "@/components/AdminTable";
import AdminModal from "@/components/AdminModal";
import { Field, TextInput, TextArea, SubmitButton } from "@/components/admin-form";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Study {
  id: string;
  title: string;
  slug: string;
  client: string;
  summary: string;
  content: string;
  coverImage: string | null;
  metrics: Record<string, string> | null;
  isPublished: boolean;
}

const emptyForm = { title: "", slug: "", client: "", summary: "", content: "", coverImage: "", metricsText: "", isPublished: false };

function parseMetrics(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  text.split("\n").forEach((line) => {
    const [label, value] = line.split(":").map((s) => s.trim());
    if (label && value) result[label] = value;
  });
  return result;
}

function metricsToText(metrics: Record<string, string> | null): string {
  if (!metrics) return "";
  return Object.entries(metrics).map(([k, v]) => `${k}: ${v}`).join("\n");
}

export default function AdminCaseStudiesPage() {
  const [studies, setStudies] = useState<Study[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Study | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/case-studies");
    const json = await res.json();
    setStudies(json.studies ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(s: Study) {
    setEditing(s);
    setForm({
      title: s.title, slug: s.slug, client: s.client, summary: s.summary, content: s.content,
      coverImage: s.coverImage ?? "", metricsText: metricsToText(s.metrics), isPublished: s.isPublished,
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const { metricsText, ...rest } = form;
    const payload = { ...rest, metrics: parseMetrics(metricsText) };
    const res = await fetch(editing ? `/api/admin/case-studies/${editing.id}` : "/api/admin/case-studies", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setSubmitting(false);
    if (!res.ok) { setError(json.error ?? "Something went wrong."); return; }
    setModalOpen(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this case study?")) return;
    await fetch(`/api/admin/case-studies/${id}`, { method: "DELETE" });
    load();
  }

  const columns: Column<Study>[] = [
    { header: "Title", render: (s) => <div><p className="font-medium">{s.title}</p><p className="text-xs text-foreground/40">/{s.slug}</p></div> },
    { header: "Client", render: (s) => s.client },
    { header: "Status", render: (s) => <span className={s.isPublished ? "text-accent-glow" : "text-foreground/40"}>{s.isPublished ? "Published" : "Draft"}</span> },
    {
      header: "Actions",
      render: (s) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(s)} className="text-foreground/50 hover:text-accent-soft"><Pencil size={14} /></button>
          <button onClick={() => handleDelete(s.id)} className="text-foreground/50 hover:text-red-400"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Reveal>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Case Studies</h1>
          <button onClick={openCreate} className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-soft">
            <Plus size={14} /> New case study
          </button>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        {studies === null ? <p className="text-sm text-foreground/50">Loading…</p> : (
          <AdminTable columns={columns} rows={studies} keyField={(s) => s.id} emptyMessage="No case studies yet." />
        )}
      </Reveal>

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit case study" : "New case study"}>
        <form onSubmit={handleSubmit}>
          <Field label="Title"><TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
          <Field label="Slug"><TextInput value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></Field>
          <Field label="Client"><TextInput value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} required /></Field>
          <Field label="Summary"><TextArea rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} required /></Field>
          <Field label="Content"><TextArea rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required /></Field>
          <Field label="Cover image URL (optional)"><TextInput value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} /></Field>
          <Field label="Metrics — one 'Label: Value' per line">
            <TextArea rows={3} value={form.metricsText} onChange={(e) => setForm({ ...form, metricsText: e.target.value })} placeholder={"Tools replaced: 3 → 1\nTime saved / week: ~6 hrs"} />
          </Field>
          <label className="mb-4 flex items-center gap-2 text-sm text-foreground/70">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
            Published
          </label>
          {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
          <SubmitButton loading={submitting}>{editing ? "Save changes" : "Create case study"}</SubmitButton>
        </form>
      </AdminModal>
    </div>
  );
}

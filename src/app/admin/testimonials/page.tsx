"use client";

import { useEffect, useState, useCallback } from "react";
import Reveal from "@/components/Reveal";
import AdminTable, { type Column } from "@/components/AdminTable";
import AdminModal from "@/components/AdminModal";
import { Field, TextInput, TextArea, SubmitButton } from "@/components/admin-form";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Testimonial {
  id: string;
  authorName: string;
  authorRole: string | null;
  avatarUrl: string | null;
  content: string;
  rating: number;
  isFeatured: boolean;
}

const emptyForm = { authorName: "", authorRole: "", avatarUrl: "", content: "", rating: 5, isFeatured: false };

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/testimonials");
    const json = await res.json();
    setItems(json.testimonials ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(t: Testimonial) {
    setEditing(t);
    setForm({ authorName: t.authorName, authorRole: t.authorRole ?? "", avatarUrl: t.avatarUrl ?? "", content: t.content, rating: t.rating, isFeatured: t.isFeatured });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const res = await fetch(editing ? `/api/admin/testimonials/${editing.id}` : "/api/admin/testimonials", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setSubmitting(false);
    if (!res.ok) { setError(json.error ?? "Something went wrong."); return; }
    setModalOpen(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    load();
  }

  const columns: Column<Testimonial>[] = [
    { header: "Author", render: (t) => <div><p className="font-medium">{t.authorName}</p><p className="text-xs text-foreground/40">{t.authorRole ?? "—"}</p></div> },
    { header: "Content", render: (t) => <span className="line-clamp-2 max-w-xs text-xs text-foreground/60">{t.content}</span> },
    { header: "Rating", render: (t) => "★".repeat(t.rating) },
    { header: "Featured", render: (t) => <span className={t.isFeatured ? "text-accent-glow" : "text-foreground/40"}>{t.isFeatured ? "Yes" : "No"}</span> },
    {
      header: "Actions",
      render: (t) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(t)} className="text-foreground/50 hover:text-accent-soft"><Pencil size={14} /></button>
          <button onClick={() => handleDelete(t.id)} className="text-foreground/50 hover:text-red-400"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Reveal>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Testimonials</h1>
          <button onClick={openCreate} className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-soft">
            <Plus size={14} /> New testimonial
          </button>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        {items === null ? <p className="text-sm text-foreground/50">Loading…</p> : (
          <AdminTable columns={columns} rows={items} keyField={(t) => t.id} emptyMessage="No testimonials yet." />
        )}
      </Reveal>

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit testimonial" : "New testimonial"}>
        <form onSubmit={handleSubmit}>
          <Field label="Author name"><TextInput value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} required /></Field>
          <Field label="Author role (optional)"><TextInput value={form.authorRole} onChange={(e) => setForm({ ...form, authorRole: e.target.value })} /></Field>
          <Field label="Avatar URL (optional)"><TextInput value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} /></Field>
          <Field label="Content"><TextArea rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required /></Field>
          <Field label="Rating (1-5)"><TextInput type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} /></Field>
          <label className="mb-4 flex items-center gap-2 text-sm text-foreground/70">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
            Featured on homepage
          </label>
          {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
          <SubmitButton loading={submitting}>{editing ? "Save changes" : "Create testimonial"}</SubmitButton>
        </form>
      </AdminModal>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import Reveal from "@/components/Reveal";
import AdminTable, { type Column } from "@/components/AdminTable";
import AdminModal from "@/components/AdminModal";
import { Field, TextInput, TextArea, SubmitButton } from "@/components/admin-form";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  order: number;
}

const emptyForm = { question: "", answer: "", category: "", order: 0 };

export default function AdminFAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/faqs");
    const json = await res.json();
    setFaqs(json.faqs ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(f: FAQ) {
    setEditing(f);
    setForm({ question: f.question, answer: f.answer, category: f.category ?? "", order: f.order });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const res = await fetch(editing ? `/api/admin/faqs/${editing.id}` : "/api/admin/faqs", {
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
    if (!confirm("Delete this FAQ?")) return;
    await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
    load();
  }

  const columns: Column<FAQ>[] = [
    { header: "Question", render: (f) => <span className="line-clamp-1 max-w-sm font-medium">{f.question}</span> },
    { header: "Category", render: (f) => f.category ?? "—" },
    { header: "Order", render: (f) => f.order },
    {
      header: "Actions",
      render: (f) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(f)} className="text-foreground/50 hover:text-accent-soft"><Pencil size={14} /></button>
          <button onClick={() => handleDelete(f.id)} className="text-foreground/50 hover:text-red-400"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Reveal>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">FAQs</h1>
          <button onClick={openCreate} className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-soft">
            <Plus size={14} /> New FAQ
          </button>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        {faqs === null ? <p className="text-sm text-foreground/50">Loading…</p> : (
          <AdminTable columns={columns} rows={faqs} keyField={(f) => f.id} emptyMessage="No FAQs yet." />
        )}
      </Reveal>

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit FAQ" : "New FAQ"}>
        <form onSubmit={handleSubmit}>
          <Field label="Question"><TextInput value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required /></Field>
          <Field label="Answer"><TextArea rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category (optional)"><TextInput value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
            <Field label="Order"><TextInput type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></Field>
          </div>
          {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
          <SubmitButton loading={submitting}>{editing ? "Save changes" : "Create FAQ"}</SubmitButton>
        </form>
      </AdminModal>
    </div>
  );
}

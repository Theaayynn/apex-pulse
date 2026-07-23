"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import GlassCard from "@/components/GlassCard";
import Reveal from "@/components/Reveal";
import AdminModal from "@/components/AdminModal";
import { Field, TextInput, SubmitButton } from "@/components/admin-form";
import { Plus, Trash2 } from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  category: string | null;
}

const emptyForm = { title: "", imageUrl: "", category: "" };

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/gallery");
    const json = await res.json();
    setItems(json.items ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/admin/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setSubmitting(false);
    if (!res.ok) { setError(json.error ?? "Something went wrong."); return; }
    setForm(emptyForm);
    setModalOpen(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this image?")) return;
    await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <Reveal>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Gallery</h1>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-soft">
            <Plus size={14} /> Add image
          </button>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        {items === null ? (
          <p className="text-sm text-foreground/50">Loading…</p>
        ) : items.length === 0 ? (
          <GlassCard className="py-16 text-center text-sm text-foreground/50">No images yet.</GlassCard>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <div key={item.id} className="group relative aspect-square overflow-hidden rounded-2xl border border-border">
                <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="25vw" />
                <div className="absolute inset-0 flex flex-col justify-between bg-black/50 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-red-500/80 text-white"
                  >
                    <Trash2 size={13} />
                  </button>
                  <p className="text-xs font-medium text-white">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Reveal>

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title="Add gallery image">
        <form onSubmit={handleSubmit}>
          <Field label="Title"><TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
          <Field label="Image URL"><TextInput value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} required /></Field>
          <Field label="Category (optional)"><TextInput value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
          {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
          <SubmitButton loading={submitting}>Add image</SubmitButton>
        </form>
      </AdminModal>
    </div>
  );
}

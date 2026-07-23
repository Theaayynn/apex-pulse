"use client";

import { useEffect, useState, useCallback } from "react";
import Reveal from "@/components/Reveal";
import AdminTable, { type Column } from "@/components/AdminTable";
import AdminModal from "@/components/AdminModal";
import { Field, TextInput, TextArea, SubmitButton } from "@/components/admin-form";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  authorName: string;
  tags: string[];
  isPublished: boolean;
  publishedAt: string | null;
}

const emptyForm = { title: "", slug: "", excerpt: "", content: "", coverImage: "", authorName: "Apex Pulse Team", tags: "", isPublished: false };

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/blog");
    const json = await res.json();
    setPosts(json.posts ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(p: Post) {
    setEditing(p);
    setForm({
      title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content,
      coverImage: p.coverImage ?? "", authorName: p.authorName, tags: p.tags.join(", "), isPublished: p.isPublished,
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const payload = { ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) };
    const res = await fetch(editing ? `/api/admin/blog/${editing.id}` : "/api/admin/blog", {
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
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    load();
  }

  const columns: Column<Post>[] = [
    { header: "Title", render: (p) => <div><p className="font-medium">{p.title}</p><p className="text-xs text-foreground/40">/{p.slug}</p></div> },
    { header: "Author", render: (p) => p.authorName },
    { header: "Tags", render: (p) => <span className="text-xs text-foreground/50">{p.tags.join(", ") || "—"}</span> },
    { header: "Status", render: (p) => <span className={p.isPublished ? "text-accent-glow" : "text-foreground/40"}>{p.isPublished ? "Published" : "Draft"}</span> },
    {
      header: "Actions",
      render: (p) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(p)} className="text-foreground/50 hover:text-accent-soft"><Pencil size={14} /></button>
          <button onClick={() => handleDelete(p.id)} className="text-foreground/50 hover:text-red-400"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Reveal>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Blog</h1>
          <button onClick={openCreate} className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-soft">
            <Plus size={14} /> New post
          </button>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        {posts === null ? <p className="text-sm text-foreground/50">Loading…</p> : (
          <AdminTable columns={columns} rows={posts} keyField={(p) => p.id} emptyMessage="No posts yet." />
        )}
      </Reveal>

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit post" : "New post"}>
        <form onSubmit={handleSubmit}>
          <Field label="Title"><TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
          <Field label="Slug"><TextInput value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></Field>
          <Field label="Excerpt"><TextArea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} required /></Field>
          <Field label="Content"><TextArea rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required /></Field>
          <Field label="Cover image URL (optional)"><TextInput value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} /></Field>
          <Field label="Author"><TextInput value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} required /></Field>
          <Field label="Tags (comma-separated)"><TextInput value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></Field>
          <label className="mb-4 flex items-center gap-2 text-sm text-foreground/70">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
            Published
          </label>
          {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
          <SubmitButton loading={submitting}>{editing ? "Save changes" : "Create post"}</SubmitButton>
        </form>
      </AdminModal>
    </div>
  );
}

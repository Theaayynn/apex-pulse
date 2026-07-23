"use client";

import { useEffect, useState, useCallback } from "react";
import GlassCard from "@/components/GlassCard";
import Reveal from "@/components/Reveal";
import AdminTable, { type Column } from "@/components/AdminTable";
import AdminModal from "@/components/AdminModal";
import { Field, TextInput, TextArea, SubmitButton } from "@/components/admin-form";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: string[];
  isActive: boolean;
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  priceMonthly: 0,
  priceYearly: 0,
  currency: "INR",
  features: "",
  isActive: true,
};

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/plans");
    const json = await res.json();
    setPlans(json.plans ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(plan: Plan) {
    setEditing(plan);
    setForm({
      name: plan.name,
      slug: plan.slug,
      description: plan.description ?? "",
      priceMonthly: plan.priceMonthly / 100,
      priceYearly: plan.priceYearly / 100,
      currency: plan.currency,
      features: plan.features.join(", "),
      isActive: plan.isActive,
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      priceMonthly: Math.round(Number(form.priceMonthly) * 100),
      priceYearly: Math.round(Number(form.priceYearly) * 100),
      currency: form.currency,
      features: form.features.split(",").map((f) => f.trim()).filter(Boolean),
      isActive: form.isActive,
    };

    const res = await fetch(editing ? `/api/admin/plans/${editing.id}` : "/api/admin/plans", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(json.error ?? "Something went wrong.");
      return;
    }
    setModalOpen(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this plan? This cannot be undone.")) return;
    await fetch(`/api/admin/plans/${id}`, { method: "DELETE" });
    load();
  }

  const columns: Column<Plan>[] = [
    { header: "Name", render: (p) => <div><p className="font-medium">{p.name}</p><p className="text-xs text-foreground/40">{p.slug}</p></div> },
    { header: "Monthly", render: (p) => `₹${(p.priceMonthly / 100).toLocaleString()}` },
    { header: "Yearly", render: (p) => `₹${(p.priceYearly / 100).toLocaleString()}` },
    { header: "Features", render: (p) => <span className="text-xs text-foreground/50">{p.features.length} listed</span> },
    { header: "Status", render: (p) => <span className={p.isActive ? "text-accent-glow" : "text-foreground/40"}>{p.isActive ? "Active" : "Inactive"}</span> },
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
          <h1 className="text-2xl font-semibold tracking-tight">Plans</h1>
          <button onClick={openCreate} className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-soft">
            <Plus size={14} /> New plan
          </button>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        {plans === null ? (
          <p className="text-sm text-foreground/50">Loading…</p>
        ) : (
          <AdminTable columns={columns} rows={plans} keyField={(p) => p.id} emptyMessage="No plans yet." />
        )}
      </Reveal>

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit plan" : "New plan"}>
        <form onSubmit={handleSubmit}>
          <Field label="Name">
            <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Slug">
            <TextInput value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
          </Field>
          <Field label="Description">
            <TextArea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Monthly price (₹)">
              <TextInput type="number" min={0} value={form.priceMonthly} onChange={(e) => setForm({ ...form, priceMonthly: Number(e.target.value) })} required />
            </Field>
            <Field label="Yearly price (₹)">
              <TextInput type="number" min={0} value={form.priceYearly} onChange={(e) => setForm({ ...form, priceYearly: Number(e.target.value) })} required />
            </Field>
          </div>
          <Field label="Features (comma-separated)">
            <TextArea rows={2} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Unlimited projects, Priority support, Custom domain" />
          </Field>
          <label className="mb-4 flex items-center gap-2 text-sm text-foreground/70">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active (visible on pricing page)
          </label>
          {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
          <SubmitButton loading={submitting}>{editing ? "Save changes" : "Create plan"}</SubmitButton>
        </form>
      </AdminModal>
    </div>
  );
}

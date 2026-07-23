"use client";

import { useEffect, useState, useCallback } from "react";
import Reveal from "@/components/Reveal";
import AdminTable, { type Column } from "@/components/AdminTable";
import AdminModal from "@/components/AdminModal";
import { Field, TextInput, Select, SubmitButton } from "@/components/admin-form";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  maxRedemptions: number | null;
  redeemedCount: number;
  expiresAt: string | null;
  isActive: boolean;
}

const emptyForm = { code: "", discountType: "PERCENT", discountValue: 10, maxRedemptions: "", expiresAt: "", isActive: true };

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/coupons");
    const json = await res.json();
    setCoupons(json.coupons ?? []);
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

  function openEdit(c: Coupon) {
    setEditing(c);
    setForm({
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      maxRedemptions: c.maxRedemptions?.toString() ?? "",
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
      isActive: c.isActive,
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = {
      code: form.code,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : undefined,
      expiresAt: form.expiresAt || undefined,
      isActive: form.isActive,
    };

    const res = await fetch(editing ? `/api/admin/coupons/${editing.id}` : "/api/admin/coupons", {
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
    if (!confirm("Delete this coupon?")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    load();
  }

  const columns: Column<Coupon>[] = [
    { header: "Code", render: (c) => <span className="font-mono font-medium">{c.code}</span> },
    { header: "Discount", render: (c) => (c.discountType === "PERCENT" ? `${c.discountValue}%` : `₹${c.discountValue}`) },
    { header: "Redeemed", render: (c) => `${c.redeemedCount}${c.maxRedemptions ? ` / ${c.maxRedemptions}` : ""}` },
    { header: "Expires", render: (c) => (c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never") },
    { header: "Status", render: (c) => <span className={c.isActive ? "text-accent-glow" : "text-foreground/40"}>{c.isActive ? "Active" : "Inactive"}</span> },
    {
      header: "Actions",
      render: (c) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(c)} className="text-foreground/50 hover:text-accent-soft"><Pencil size={14} /></button>
          <button onClick={() => handleDelete(c.id)} className="text-foreground/50 hover:text-red-400"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Reveal>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Coupons</h1>
          <button onClick={openCreate} className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-soft">
            <Plus size={14} /> New coupon
          </button>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        {coupons === null ? <p className="text-sm text-foreground/50">Loading…</p> : (
          <AdminTable columns={columns} rows={coupons} keyField={(c) => c.id} emptyMessage="No coupons yet." />
        )}
      </Reveal>

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit coupon" : "New coupon"}>
        <form onSubmit={handleSubmit}>
          <Field label="Code">
            <TextInput value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <Select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                <option value="PERCENT">Percent</option>
                <option value="FLAT">Flat (₹)</option>
              </Select>
            </Field>
            <Field label="Value">
              <TextInput type="number" min={1} value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} required />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Max redemptions (optional)">
              <TextInput type="number" min={1} value={form.maxRedemptions} onChange={(e) => setForm({ ...form, maxRedemptions: e.target.value })} />
            </Field>
            <Field label="Expires (optional)">
              <TextInput type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
            </Field>
          </div>
          <label className="mb-4 flex items-center gap-2 text-sm text-foreground/70">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active
          </label>
          {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
          <SubmitButton loading={submitting}>{editing ? "Save changes" : "Create coupon"}</SubmitButton>
        </form>
      </AdminModal>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import Reveal from "@/components/Reveal";
import AdminTable, { type Column } from "@/components/AdminTable";
import { Check, X, Trash2 } from "lucide-react";

interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[] | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/reviews");
    const json = await res.json();
    setReviews(json.reviews ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function setApproval(id: string, isApproved: boolean) {
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved }),
    });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    load();
  }

  const columns: Column<Review>[] = [
    { header: "Author", render: (r) => r.authorName },
    { header: "Rating", render: (r) => "★".repeat(r.rating) },
    { header: "Comment", render: (r) => <span className="line-clamp-2 max-w-sm text-xs text-foreground/60">{r.comment}</span> },
    { header: "Date", render: (r) => new Date(r.createdAt).toLocaleDateString() },
    {
      header: "Status",
      render: (r) => <span className={r.isApproved ? "text-accent-glow" : "text-yellow-400"}>{r.isApproved ? "Approved" : "Pending"}</span>,
    },
    {
      header: "Actions",
      render: (r) => (
        <div className="flex gap-2">
          {!r.isApproved ? (
            <button onClick={() => setApproval(r.id, true)} className="text-accent-glow hover:opacity-70" title="Approve"><Check size={14} /></button>
          ) : (
            <button onClick={() => setApproval(r.id, false)} className="text-yellow-400 hover:opacity-70" title="Unapprove"><X size={14} /></button>
          )}
          <button onClick={() => handleDelete(r.id)} className="text-foreground/50 hover:text-red-400" title="Delete"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Reveal>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Reviews</h1>
      </Reveal>
      <Reveal delay={0.05}>
        {reviews === null ? <p className="text-sm text-foreground/50">Loading…</p> : (
          <AdminTable columns={columns} rows={reviews} keyField={(r) => r.id} emptyMessage="No reviews submitted yet." />
        )}
      </Reveal>
    </div>
  );
}

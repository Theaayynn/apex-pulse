"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import GlassCard from "@/components/GlassCard";
import Reveal from "@/components/Reveal";
import { Send } from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  message: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  user: { id: string; name: string; email: string };
  assignee: { id: string; name: string } | null;
  messages: Message[];
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

export default function AdminTicketDetailPage() {
  const params = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/support/${params.id}`);
    if (res.ok) setTicket((await res.json()).ticket);
  }, [params.id]);

  useEffect(() => {
    load();
    fetch("/api/admin/team").then((r) => r.json()).then((j) => setTeam(j.team ?? []));
  }, [load]);

  async function updateTicket(data: Partial<{ status: string; priority: string; assigneeId: string | null }>) {
    await fetch(`/api/admin/support/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    load();
  }

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    setError("");
    const res = await fetch(`/api/admin/support/${params.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: reply }),
    });
    const json = await res.json();
    setSending(false);
    if (!res.ok) { setError(json.error ?? "Something went wrong."); return; }
    setReply("");
    load();
  }

  if (!ticket) return <p className="text-sm text-foreground/50">Loading…</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div>
        <Reveal>
          <h1 className="mb-1 text-2xl font-semibold tracking-tight">{ticket.subject}</h1>
          <p className="mb-6 text-sm text-foreground/50">{ticket.user.name} · {ticket.user.email}</p>
        </Reveal>

        <div className="space-y-3">
          {ticket.messages.map((m, i) => {
            const isCustomer = m.senderId === ticket.user.id;
            return (
              <Reveal key={m.id} delay={Math.min(i * 0.04, 0.3)}>
                <GlassCard className={!isCustomer ? "border-accent/30 bg-accent/5" : ""}>
                  <p className="mb-1 text-xs text-foreground/40">
                    {isCustomer ? ticket.user.name : "Support team"} · {new Date(m.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-foreground/80">{m.message}</p>
                </GlassCard>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1} className="mt-6">
          <form onSubmit={sendReply} className="flex gap-2">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Reply to customer…"
              className="flex-1 rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
            <button type="submit" disabled={sending || !reply.trim()} className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-soft disabled:opacity-50">
              <Send size={14} /> Send
            </button>
          </form>
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </Reveal>
      </div>

      <Reveal delay={0.05}>
        <GlassCard className="h-fit space-y-4">
          <div>
            <label className="mb-1 block text-xs text-foreground/50">Status</label>
            <select value={ticket.status} onChange={(e) => updateTicket({ status: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent">
              {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-foreground/50">Priority</label>
            <select value={ticket.priority} onChange={(e) => updateTicket({ priority: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent">
              {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-foreground/50">Assignee</label>
            <select
              value={ticket.assignee?.id ?? ""}
              onChange={(e) => updateTicket({ assigneeId: e.target.value || null })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="">Unassigned</option>
              {team.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.role})</option>)}
            </select>
          </div>
        </GlassCard>
      </Reveal>
    </div>
  );
}

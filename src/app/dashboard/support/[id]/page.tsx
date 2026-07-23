"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import GlassCard from "@/components/GlassCard";
import Reveal from "@/components/Reveal";
import { Send } from "lucide-react";

interface TicketMessage {
  id: string;
  senderId: string;
  message: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  messages: TicketMessage[];
}

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-yellow-500/15 text-yellow-400",
  IN_PROGRESS: "bg-accent/15 text-accent-soft",
  RESOLVED: "bg-accent-glow/15 text-accent-glow",
  CLOSED: "bg-white/10 text-foreground/40",
};

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/user/support/${params.id}`);
    if (!res.ok) {
      setNotFound(true);
      return;
    }
    const json = await res.json();
    setTicket(json.ticket);
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    setError("");
    const res = await fetch(`/api/user/support/${params.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: reply }),
    });
    const json = await res.json();
    setSending(false);
    if (!res.ok) {
      setError(json.error ?? "Something went wrong.");
      return;
    }
    setReply("");
    load();
  }

  if (notFound) {
    return <p className="text-sm text-foreground/50">Ticket not found.</p>;
  }

  if (!ticket) {
    return <p className="text-sm text-foreground/50">Loading…</p>;
  }

  return (
    <div>
      <Reveal>
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">{ticket.subject}</h1>
          <span className={`rounded-full px-3 py-1 text-xs ${STATUS_STYLES[ticket.status]}`}>
            {ticket.status.replace("_", " ")}
          </span>
        </div>
      </Reveal>

      <div className="space-y-3">
        {ticket.messages.map((m, i) => {
          const isOwner = m.senderId === ticket.userId;
          return (
            <Reveal key={m.id} delay={Math.min(i * 0.04, 0.3)}>
              <GlassCard className={isOwner ? "" : "border-accent/30 bg-accent/5"}>
                <p className="mb-1 text-xs text-foreground/40">
                  {isOwner ? "You" : "Support team"} · {new Date(m.createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-foreground/80">{m.message}</p>
              </GlassCard>
            </Reveal>
          );
        })}
      </div>

      {ticket.status !== "CLOSED" ? (
        <Reveal delay={0.1} className="mt-6">
          <form onSubmit={sendReply} className="flex gap-2">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write a reply…"
              className="flex-1 rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={sending || !reply.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-soft disabled:opacity-50"
            >
              <Send size={14} /> Send
            </button>
          </form>
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </Reveal>
      ) : (
        <p className="mt-6 text-sm text-foreground/40">This ticket is closed.</p>
      )}
    </div>
  );
}

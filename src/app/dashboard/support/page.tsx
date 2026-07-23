import Link from "next/link";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import GlassCard from "@/components/GlassCard";
import Reveal from "@/components/Reveal";
import { LifeBuoy, Plus } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-yellow-500/15 text-yellow-400",
  IN_PROGRESS: "bg-accent/15 text-accent-soft",
  RESOLVED: "bg-accent-glow/15 text-accent-glow",
  CLOSED: "bg-white/10 text-foreground/40",
};

const PRIORITY_STYLES: Record<string, string> = {
  LOW: "text-foreground/40",
  MEDIUM: "text-foreground/60",
  HIGH: "text-yellow-400",
  URGENT: "text-red-400",
};

export default async function SupportPage() {
  const user = await requireUser();
  const tickets = await prisma.supportTicket.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { messages: true } } },
  });

  return (
    <div>
      <Reveal>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Support</h1>
          <Link
            href="/dashboard/support/new"
            className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-soft"
          >
            <Plus size={14} /> New ticket
          </Link>
        </div>
      </Reveal>

      {tickets.length === 0 ? (
        <GlassCard className="flex flex-col items-center py-16 text-center">
          <LifeBuoy className="mb-3 text-foreground/30" size={28} />
          <p className="mb-4 text-sm text-foreground/50">No support tickets yet.</p>
          <Link href="/dashboard/support/new" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-soft">
            Open your first ticket
          </Link>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/dashboard/support/${ticket.id}`}>
              <GlassCard className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{ticket.subject}</p>
                  <p className="mt-0.5 text-xs text-foreground/40">
                    {ticket._count.messages} message{ticket._count.messages !== 1 ? "s" : ""} · Updated{" "}
                    {ticket.updatedAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className={`text-xs font-medium ${PRIORITY_STYLES[ticket.priority]}`}>{ticket.priority}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs ${STATUS_STYLES[ticket.status]}`}>
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

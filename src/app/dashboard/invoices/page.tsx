import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import GlassCard from "@/components/GlassCard";
import Reveal from "@/components/Reveal";
import { Download, Receipt } from "lucide-react";

function formatAmount(paise: number, currency: string) {
  const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency + " ";
  return `${symbol}${(paise / 100).toLocaleString()}`;
}

const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-accent-glow/15 text-accent-glow",
  SENT: "bg-yellow-500/15 text-yellow-400",
  OVERDUE: "bg-red-500/15 text-red-400",
  DRAFT: "bg-white/10 text-foreground/50",
  VOID: "bg-white/10 text-foreground/40",
};

export default async function InvoicesPage() {
  const user = await requireUser();
  const invoices = await prisma.invoice.findMany({
    where: { userId: user.id },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div>
      <Reveal>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Invoices</h1>
      </Reveal>

      {invoices.length === 0 ? (
        <GlassCard className="flex flex-col items-center py-16 text-center">
          <Receipt className="mb-3 text-foreground/30" size={28} />
          <p className="text-sm text-foreground/50">No invoices yet — they&apos;ll appear here after your first order.</p>
        </GlassCard>
      ) : (
        <GlassCard className="overflow-hidden !p-0">
          <div className="divide-y divide-border">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{inv.invoiceNumber}</p>
                  <p className="text-xs text-foreground/40">
                    Issued {inv.issuedAt.toLocaleDateString()}
                    {inv.dueAt && ` · Due ${inv.dueAt.toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs ${STATUS_STYLES[inv.status] ?? ""}`}>
                    {inv.status}
                  </span>
                  <span className="text-sm font-medium">{formatAmount(inv.amount, inv.currency)}</span>
                  {inv.pdfUrl ? (
                    <a
                      href={inv.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:border-accent/40"
                      aria-label="Download invoice PDF"
                    >
                      <Download size={14} />
                    </a>
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border opacity-30">
                      <Download size={14} />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

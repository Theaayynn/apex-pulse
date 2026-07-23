import Link from "next/link";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import GlassCard from "@/components/GlassCard";
import Reveal from "@/components/Reveal";
import { ShoppingBag } from "lucide-react";

function formatAmount(paise: number, currency: string) {
  const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency + " ";
  return `${symbol}${(paise / 100).toLocaleString()}`;
}

const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-accent-glow/15 text-accent-glow",
  PENDING: "bg-yellow-500/15 text-yellow-400",
  FAILED: "bg-red-500/15 text-red-400",
  REFUNDED: "bg-white/10 text-foreground/50",
  CANCELLED: "bg-white/10 text-foreground/40",
};

export default async function OrdersPage() {
  const user = await requireUser();
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { plan: true, invoice: true },
  });

  return (
    <div>
      <Reveal>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Orders</h1>
      </Reveal>

      {orders.length === 0 ? (
        <GlassCard className="flex flex-col items-center py-16 text-center">
          <ShoppingBag className="mb-3 text-foreground/30" size={28} />
          <p className="mb-4 text-sm text-foreground/50">You haven&apos;t placed any orders yet.</p>
          <Link href="/pricing" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-soft">
            Browse plans
          </Link>
        </GlassCard>
      ) : (
        <GlassCard className="overflow-hidden !p-0">
          <div className="divide-y divide-border">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{order.plan?.name ?? "Custom order"}</p>
                  <p className="text-xs text-foreground/40">
                    {order.createdAt.toLocaleDateString()}
                    {order.gateway && ` · ${order.gateway}`}
                    {order.invoice && ` · Invoice ${order.invoice.invoiceNumber}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs ${STATUS_STYLES[order.status] ?? ""}`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-medium">{formatAmount(order.amount, order.currency)}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

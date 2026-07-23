"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Reveal from "@/components/Reveal";
import GlassCard from "@/components/GlassCard";
import MagneticButton from "@/components/MagneticButton";
import { CheckCircle2, Clock } from "lucide-react";

interface OrderStatus {
  status: string;
  planName: string | null;
}

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("order");
  const [order, setOrder] = useState<OrderStatus | null>(null);

  useEffect(() => {
    if (!orderId) return;
    let attempts = 0;
    const poll = async () => {
      const res = await fetch(`/api/orders/${orderId}/status`);
      if (res.ok) {
        const json = await res.json();
        setOrder(json);
        // Stripe confirms via webhook, which can take a few seconds — poll briefly.
        if (json.status === "PENDING" && attempts < 8) {
          attempts += 1;
          setTimeout(poll, 1500);
        }
      }
    };
    poll();
  }, [orderId]);

  const isPaid = order?.status === "PAID";

  return (
    <div className="mx-auto max-w-md text-center">
      <Reveal>
        <GlassCard className="px-8 py-12">
          {isPaid ? (
            <>
              <CheckCircle2 className="mx-auto mb-4 text-accent-glow" size={40} />
              <h1 className="mb-2 text-xl font-semibold">Payment confirmed</h1>
              <p className="mb-6 text-sm text-foreground/55">
                {order.planName ? `Your ${order.planName} plan is now active.` : "Your payment was successful."} A receipt has been emailed to you.
              </p>
            </>
          ) : (
            <>
              <Clock className="mx-auto mb-4 animate-pulse text-yellow-400" size={40} />
              <h1 className="mb-2 text-xl font-semibold">Confirming payment…</h1>
              <p className="mb-6 text-sm text-foreground/55">
                This usually takes a few seconds. You can safely head to your dashboard — we'll email you once it's confirmed.
              </p>
            </>
          )}
          <MagneticButton href="/dashboard/orders">View orders</MagneticButton>
        </GlassCard>
      </Reveal>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <main className="px-6 pt-32 pb-24">
      <Suspense fallback={null}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}

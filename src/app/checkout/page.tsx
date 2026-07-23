"use client";

import { useEffect, useState, Suspense } from "react";
import Script from "next/script";
import { useSearchParams, useRouter } from "next/navigation";
import GlassCard from "@/components/GlassCard";
import Reveal from "@/components/Reveal";
import { Tag, Check } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: string[];
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function formatAmount(paise: number, currency: string) {
  const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency + " ";
  return `${symbol}${(paise / 100).toLocaleString()}`;
}

function CheckoutContent() {
  const params = useSearchParams();
  const router = useRouter();
  const planSlug = params.get("plan");
  const cycle = (params.get("cycle") as "monthly" | "yearly") ?? "monthly";

  const [plan, setPlan] = useState<Plan | null>(null);
  const [coupon, setCoupon] = useState("");
  const [error, setError] = useState("");
  const [loadingGateway, setLoadingGateway] = useState<"stripe" | "razorpay" | null>(null);

  useEffect(() => {
    if (!planSlug) return;
    fetch("/api/plans/" + planSlug)
      .then((res) => res.json())
      .then((json) => setPlan(json.plan ?? null));
  }, [planSlug]);

  const baseAmount = plan ? (cycle === "monthly" ? plan.priceMonthly : plan.priceYearly) : 0;

  async function payWithStripe() {
    setError("");
    setLoadingGateway("stripe");
    const res = await fetch("/api/payments/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planSlug, cycle, couponCode: coupon || undefined }),
    });
    const json = await res.json();
    setLoadingGateway(null);
    if (!res.ok) { setError(json.error ?? "Something went wrong."); return; }
    window.location.href = json.url;
  }

  async function payWithRazorpay() {
    setError("");
    setLoadingGateway("razorpay");
    const res = await fetch("/api/payments/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planSlug, cycle, couponCode: coupon || undefined }),
    });
    const json = await res.json();
    setLoadingGateway(null);
    if (!res.ok) { setError(json.error ?? "Something went wrong."); return; }

    const rzp = new window.Razorpay({
      key: json.keyId,
      amount: json.amount,
      currency: json.currency,
      name: "Apex Pulse",
      description: `${plan?.name} (${cycle})`,
      order_id: json.razorpayOrderId,
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        const verifyRes = await fetch("/api/payments/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...response, orderId: json.orderId }),
        });
        if (verifyRes.ok) {
          router.push(`/checkout/success?order=${json.orderId}`);
        } else {
          router.push(`/checkout/cancel?order=${json.orderId}`);
        }
      },
      theme: { color: "#7C5CFF" },
    });
    rzp.open();
  }

  if (!planSlug) {
    return <p className="text-center text-sm text-foreground/50">No plan selected. Go back to <a href="/pricing" className="text-accent-soft hover:underline">Pricing</a>.</p>;
  }

  if (!plan) {
    return <p className="text-center text-sm text-foreground/50">Loading plan…</p>;
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="mx-auto max-w-md">
        <Reveal>
          <h1 className="mb-6 text-2xl font-semibold tracking-tight">Checkout</h1>
        </Reveal>

        <Reveal delay={0.05}>
          <GlassCard className="mb-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{plan.name}</p>
                <p className="text-xs text-foreground/50 capitalize">{cycle} billing</p>
              </div>
              <p className="text-2xl font-semibold">{formatAmount(baseAmount, plan.currency)}</p>
            </div>
            <ul className="space-y-1.5 border-t border-border pt-4 text-sm text-foreground/60">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check size={14} className="text-accent-glow" /> {f}
                </li>
              ))}
            </ul>
          </GlassCard>
        </Reveal>

        <Reveal delay={0.1}>
          <GlassCard className="mb-4">
            <label className="mb-2 flex items-center gap-1.5 text-sm text-foreground/70">
              <Tag size={14} /> Coupon code (optional)
            </label>
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              placeholder="e.g. LAUNCH20"
              className="w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </GlassCard>
        </Reveal>

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        <Reveal delay={0.15} className="space-y-3">
          <button
            onClick={payWithStripe}
            disabled={loadingGateway !== null}
            className="w-full rounded-lg bg-accent py-3 text-sm font-medium text-white transition hover:bg-accent-soft disabled:opacity-50"
          >
            {loadingGateway === "stripe" ? "Redirecting…" : "Pay with Stripe"}
          </button>
          <button
            onClick={payWithRazorpay}
            disabled={loadingGateway !== null}
            className="glass w-full rounded-lg py-3 text-sm font-medium transition hover:border-accent/40 disabled:opacity-50"
          >
            {loadingGateway === "razorpay" ? "Opening…" : "Pay with Razorpay"}
          </button>
        </Reveal>
        <p className="mt-4 text-center text-xs text-foreground/35">
          Payments are processed securely by Stripe/Razorpay. Apex Pulse never sees your card details.
        </p>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <main className="px-6 pt-32 pb-24">
      <Suspense fallback={<p className="text-center text-sm text-foreground/50">Loading…</p>}>
        <CheckoutContent />
      </Suspense>
    </main>
  );
}

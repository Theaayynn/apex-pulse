import type { Metadata } from "next";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundPolicyPage() {
  return (
    <main className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <h1 className="mb-2 text-4xl font-semibold tracking-tight">Refund Policy</h1>
          <p className="mb-10 text-sm text-foreground/40">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

          <div className="space-y-6 text-foreground/70">
            <section>
              <h2 className="mb-2 text-lg font-medium text-foreground">1. Subscription plans</h2>
              <p>
                Monthly plans can be cancelled at any time; you retain access until the end of the
                current billing period, with no further charges after that. Yearly plans are
                refundable on a prorated basis within the first 14 days of purchase.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-medium text-foreground">2. How to request a refund</h2>
              <p>
                Open a support ticket from your Dashboard or email us via the{" "}
                <a href="/contact" className="text-accent-soft hover:underline">contact page</a>{" "}
                with your order ID. Refunds are processed to the original payment method within
                5–10 business days.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-medium text-foreground">3. Exceptions</h2>
              <p>
                We don&apos;t refund partial months on monthly plans, or yearly plans past the
                14-day window, except where required by applicable law.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-medium text-foreground">4. Failed or disputed payments</h2>
              <p>
                If a payment fails or is disputed through your bank, your account may be
                temporarily suspended until the matter is resolved. Contact support before filing
                a chargeback — most issues are resolved faster directly with us.
              </p>
            </section>
          </div>
        </Reveal>
      </div>
    </main>
  );
}

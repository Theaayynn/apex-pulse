import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Reveal from "@/components/Reveal";
import PricingToggleGrid from "./pricing-grid";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for Apex Pulse.",
};

export const revalidate = 120;

export default async function PricingPage() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { priceMonthly: "asc" },
  });

  return (
    <main className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <span className="mb-4 inline-block rounded-full border border-border bg-surface px-4 py-1.5 text-xs text-accent-soft">
            Pricing
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Pay for what you use. Nothing else.
          </h1>
          <p className="mt-6 text-foreground/60">
            Every plan includes the full platform — auth, admin, CMS. Higher tiers
            unlock scale, not features.
          </p>
        </Reveal>
      </div>

      {plans.length > 0 ? (
        <PricingToggleGrid plans={plans} />
      ) : (
        <p className="mt-16 text-center text-foreground/50">
          Plans are being updated — check back shortly, or{" "}
          <a href="/contact" className="text-accent-soft hover:underline">
            contact us
          </a>{" "}
          for current pricing.
        </p>
      )}
    </main>
  );
}

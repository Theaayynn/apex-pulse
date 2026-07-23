"use client";

import { useState } from "react";
import type { Plan } from "@prisma/client";
import Reveal from "@/components/Reveal";
import GlassCard from "@/components/GlassCard";
import { StaticButton } from "@/components/MagneticButton";
import { Check } from "lucide-react";

function formatPrice(paise: number, currency: string) {
  const amount = paise / 100;
  const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency + " ";
  return `${symbol}${amount.toLocaleString()}`;
}

export default function PricingToggleGrid({ plans }: { plans: Plan[] }) {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="mt-14">
      <div className="mb-12 flex items-center justify-center gap-3">
        <span className={`text-sm ${!yearly ? "text-foreground" : "text-foreground/40"}`}>Monthly</span>
        <button
          role="switch"
          aria-checked={yearly}
          onClick={() => setYearly((y) => !y)}
          className="relative h-7 w-12 rounded-full border border-border bg-surface transition-colors"
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-accent transition-transform ${
              yearly ? "translate-x-6" : "translate-x-0.5"
            }`}
          />
        </button>
        <span className={`text-sm ${yearly ? "text-foreground" : "text-foreground/40"}`}>
          Yearly <span className="text-accent-glow">— 2 months free</span>
        </span>
      </div>

      <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan, i) => {
          const price = yearly ? plan.priceYearly / 12 : plan.priceMonthly;
          const featured = i === 1 && plans.length > 1;
          return (
            <Reveal key={plan.id} delay={i * 0.08}>
              <GlassCard className={`flex h-full flex-col ${featured ? "border-accent/50" : ""}`}>
                {featured && (
                  <span className="mb-3 inline-block w-fit rounded-full bg-accent/20 px-3 py-1 text-xs text-accent-soft">
                    Most popular
                  </span>
                )}
                <h3 className="mb-1 text-lg font-medium">{plan.name}</h3>
                <p className="mb-4 text-sm text-foreground/50">{plan.description}</p>
                <p className="mb-1 text-4xl font-semibold">
                  {formatPrice(price, plan.currency)}
                  <span className="text-sm font-normal text-foreground/40">/mo</span>
                </p>
                {yearly && (
                  <p className="mb-4 text-xs text-foreground/40">
                    billed {formatPrice(plan.priceYearly, plan.currency)}/year
                  </p>
                )}
                <ul className="my-6 flex-1 space-y-2.5 text-sm text-foreground/70">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check size={16} className="mt-0.5 shrink-0 text-accent-glow" />
                      {f}
                    </li>
                  ))}
                </ul>
                <StaticButton
                  href={`/checkout?plan=${plan.slug}&cycle=${yearly ? "yearly" : "monthly"}`}
                  variant={featured ? "solid" : "glass"}
                  className="w-full"
                >
                  Get started
                </StaticButton>
              </GlassCard>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

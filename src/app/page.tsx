import { prisma } from "@/lib/prisma";
import Reveal from "@/components/Reveal";
import GlassCard from "@/components/GlassCard";
import MagneticButton, { StaticButton } from "@/components/MagneticButton";
import { Zap, ShieldCheck, LineChart, Layers, Star } from "lucide-react";

export const revalidate = 60; // ISR — homepage content refreshes at most once a minute

const FEATURES = [
  {
    icon: Zap,
    title: "Ship in days, not quarters",
    body: "A production-ready foundation — auth, billing, admin, CMS — so your team builds features, not plumbing.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    body: "Hashed passwords, rotating JWTs, rate limiting, and audit logs on every sensitive action, out of the box.",
  },
  {
    icon: LineChart,
    title: "Built to measure",
    body: "Revenue, users, and support metrics live in one dashboard — no separate analytics stack to wire up.",
  },
  {
    icon: Layers,
    title: "Every layer, owned",
    body: "Frontend, API, database, and admin panel in one codebase. Nothing hidden behind a black-box SaaS.",
  },
];

async function getHomeData() {
  const [plans, testimonials] = await Promise.all([
    prisma.plan.findMany({ where: { isActive: true }, orderBy: { priceMonthly: "asc" }, take: 3 }),
    prisma.testimonial.findMany({ where: { isFeatured: true }, take: 6, orderBy: { createdAt: "desc" } }),
  ]);
  return { plans, testimonials };
}

function formatPrice(paise: number, currency: string) {
  const amount = paise / 100;
  const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency + " ";
  return `${symbol}${amount.toLocaleString()}`;
}

export default async function Home() {
  const { plans, testimonials } = await getHomeData();

  return (
    <main>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-24 text-center">
        <Reveal>
          <span className="mb-6 inline-block rounded-full border border-border bg-surface px-4 py-1.5 text-xs text-accent-soft">
            Now shipping — full-stack platform, not a landing page
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
            Software that feels
            <br />
            <span className="bg-gradient-to-r from-accent via-accent-soft to-accent-glow bg-clip-text text-transparent">
              inevitable.
            </span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-xl text-lg text-foreground/60">
            Apex Pulse is the foundation premium products are built on — auth, billing,
            admin, and a CMS, engineered to disappear so the work you actually
            care about can stand out.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <MagneticButton href="/register">Start building — free</MagneticButton>
            <MagneticButton href="/case-studies" variant="glass">
              See it in production
            </MagneticButton>
          </div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------------- Features */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything the stack needs. Nothing it doesn&apos;t.
          </h2>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <GlassCard className="h-full">
                <f.icon className="mb-4 text-accent-soft" size={22} />
                <h3 className="mb-2 text-base font-medium">{f.title}</h3>
                <p className="text-sm text-foreground/55">{f.body}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- Pricing preview */}
      {plans.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-24">
          <Reveal className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Straightforward pricing
            </h2>
            <p className="mt-3 text-foreground/55">No surprise line items. Cancel whenever.</p>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan, i) => (
              <Reveal key={plan.id} delay={i * 0.1}>
                <GlassCard className="flex h-full flex-col">
                  <h3 className="mb-1 text-lg font-medium">{plan.name}</h3>
                  <p className="mb-4 text-sm text-foreground/50">{plan.description}</p>
                  <p className="mb-6 text-3xl font-semibold">
                    {formatPrice(plan.priceMonthly, plan.currency)}
                    <span className="text-sm font-normal text-foreground/40">/mo</span>
                  </p>
                  <ul className="mb-6 flex-1 space-y-2 text-sm text-foreground/60">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Star size={14} className="mt-0.5 shrink-0 text-accent-glow" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <StaticButton href="/pricing" variant="glass" className="w-full">
                    View details
                  </StaticButton>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- Testimonials */}
      {testimonials.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-24">
          <Reveal className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Teams building on Apex Pulse
            </h2>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.id} delay={i * 0.08}>
                <GlassCard className="h-full">
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star key={idx} size={14} className="fill-accent-glow text-accent-glow" />
                    ))}
                  </div>
                  <p className="mb-4 text-sm text-foreground/70">&ldquo;{t.content}&rdquo;</p>
                  <p className="text-sm font-medium">{t.authorName}</p>
                  {t.authorRole && <p className="text-xs text-foreground/40">{t.authorRole}</p>}
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- CTA */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <Reveal>
          <GlassCard className="px-8 py-16">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready to ship something inevitable?
            </h2>
            <p className="mb-8 text-foreground/60">
              Create an account and see the dashboard in under two minutes.
            </p>
            <MagneticButton href="/register">Get started — free</MagneticButton>
          </GlassCard>
        </Reveal>
      </section>
    </main>
  );
}

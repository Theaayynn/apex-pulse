import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import GlassCard from "@/components/GlassCard";
import MagneticButton from "@/components/MagneticButton";
import { Code2, Palette, ShieldCheck, Rocket, Database, Headphones } from "lucide-react";

export const metadata: Metadata = {
  title: "Services",
  description: "What Apex Pulse builds and maintains for your product.",
};

const SERVICES = [
  {
    icon: Code2,
    title: "Full-stack build",
    body: "Frontend, API layer, and database designed and implemented together — no hand-off gaps between design and engineering.",
  },
  {
    icon: Palette,
    title: "Product design & motion",
    body: "Interface design and interaction detail — from layout system to hover states — treated as core product work, not a final coat of paint.",
  },
  {
    icon: Database,
    title: "Data modeling",
    body: "A schema that matches how your business actually works, with room to grow — not a generic template you'll outgrow in a year.",
  },
  {
    icon: ShieldCheck,
    title: "Security & compliance",
    body: "Authentication, RBAC, audit logging, and rate limiting reviewed against real threat models, not a checklist.",
  },
  {
    icon: Rocket,
    title: "Deployment & scaling",
    body: "CI-ready from day one, with a deployment guide tuned to your infrastructure — Vercel, Railway, or your own VPS.",
  },
  {
    icon: Headphones,
    title: "Ongoing support",
    body: "A support desk built into the product itself, so issues get tracked and resolved without leaving your own admin panel.",
  },
];

export default function ServicesPage() {
  return (
    <main className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <span className="mb-4 inline-block rounded-full border border-border bg-surface px-4 py-1.5 text-xs text-accent-soft">
            Services
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            One team, the whole stack.
          </h1>
          <p className="mt-6 text-foreground/60">
            No hand-offs between a design shop and a dev shop. Every service below
            is delivered by the same people who maintain the codebase.
          </p>
        </Reveal>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.06}>
            <GlassCard className="h-full">
              <s.icon className="mb-4 text-accent-soft" size={22} />
              <h3 className="mb-2 text-base font-medium">{s.title}</h3>
              <p className="text-sm text-foreground/55">{s.body}</p>
            </GlassCard>
          </Reveal>
        ))}
      </div>

      <Reveal className="mx-auto mt-20 max-w-2xl text-center">
        <h2 className="mb-4 text-2xl font-medium">Not sure where to start?</h2>
        <p className="mb-8 text-foreground/60">
          Tell us what you're building and we'll point you at the right service.
        </p>
        <MagneticButton href="/contact">Talk to the team</MagneticButton>
      </Reveal>
    </main>
  );
}

import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import GlassCard from "@/components/GlassCard";
import { Target, Users, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "Why Apex Pulse exists and how we build.",
};

const VALUES = [
  {
    icon: Target,
    title: "Ship the whole thing",
    body: "A landing page isn't a product. We build the backend, the admin tools, and the edge cases — not just the parts that photograph well.",
  },
  {
    icon: Sparkles,
    title: "Craft is the differentiator",
    body: "Animation, spacing, and copy get the same rigor as the database schema. Users feel the difference even when they can't name it.",
  },
  {
    icon: Users,
    title: "Built with operators",
    body: "Every feature traces back to a real support ticket, sales call, or admin request — not a guess about what teams might want.",
  },
];

export default function AboutPage() {
  return (
    <main className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <span className="mb-4 inline-block rounded-full border border-border bg-surface px-4 py-1.5 text-xs text-accent-soft">
            About Apex Pulse
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            We got tired of rebuilding the same foundation.
          </h1>
          <p className="mt-6 text-lg text-foreground/60">
            Every serious product needs the same unglamorous scaffolding: accounts,
            roles, billing, an admin panel, a way to edit content without a deploy.
            Apex Pulse is that scaffolding, built once and built properly — so teams
            spend their time on what makes their product actually different.
          </p>
        </Reveal>
      </div>

      <div className="mx-auto mt-20 grid max-w-5xl gap-5 sm:grid-cols-3">
        {VALUES.map((v, i) => (
          <Reveal key={v.title} delay={i * 0.1}>
            <GlassCard className="h-full">
              <v.icon className="mb-4 text-accent-soft" size={22} />
              <h3 className="mb-2 text-base font-medium">{v.title}</h3>
              <p className="text-sm text-foreground/55">{v.body}</p>
            </GlassCard>
          </Reveal>
        ))}
      </div>

      <Reveal className="mx-auto mt-20 max-w-3xl">
        <GlassCard className="px-8 py-12 text-center">
          <p className="text-sm uppercase tracking-widest text-accent-soft">Where we are today</p>
          <p className="mt-4 text-2xl font-medium">
            A small, senior team, shipping in the open, one production-ready phase at a time.
          </p>
        </GlassCard>
      </Reveal>
    </main>
  );
}

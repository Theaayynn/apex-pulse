import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Reveal from "@/components/Reveal";
import GlassCard from "@/components/GlassCard";

export const metadata: Metadata = { title: "Case Studies", description: "Real results from teams on Apex Pulse." };
export const revalidate = 120;

export default async function CaseStudiesPage() {
  const studies = await prisma.caseStudy.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <span className="mb-4 inline-block rounded-full border border-border bg-surface px-4 py-1.5 text-xs text-accent-soft">
            Case Studies
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Results, not adjectives</h1>
          <p className="mt-6 text-foreground/60">
            What teams shipped, what changed, and the numbers behind it.
          </p>
        </Reveal>
      </div>

      {studies.length === 0 ? (
        <p className="mt-16 text-center text-foreground/50">
          Case studies are being prepared — check back soon.
        </p>
      ) : (
        <div className="mx-auto mt-16 grid max-w-5xl gap-5 sm:grid-cols-2">
          {studies.map((study, i) => (
            <Reveal key={study.id} delay={i * 0.08}>
              <Link href={`/case-studies/${study.slug}`}>
                <GlassCard className="h-full">
                  <p className="mb-2 text-xs uppercase tracking-widest text-accent-soft">{study.client}</p>
                  <h2 className="mb-2 text-lg font-medium">{study.title}</h2>
                  <p className="text-sm text-foreground/55">{study.summary}</p>
                </GlassCard>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </main>
  );
}

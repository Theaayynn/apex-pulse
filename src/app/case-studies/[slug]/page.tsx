import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Reveal from "@/components/Reveal";
import GlassCard from "@/components/GlassCard";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getStudy(slug: string) {
  return prisma.caseStudy.findUnique({ where: { slug, isPublished: true } });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = await getStudy(slug);
  if (!study) return { title: "Case study not found" };
  return { title: study.title, description: study.summary };
}

export async function generateStaticParams() {
  const studies = await prisma.caseStudy.findMany({ where: { isPublished: true }, select: { slug: true } });
  return studies.map((s) => ({ slug: s.slug }));
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = await getStudy(slug);
  if (!study) notFound();

  const metrics = (study.metrics as Record<string, string> | null) ?? null;

  return (
    <main className="px-6 pt-32 pb-24">
      <article className="mx-auto max-w-2xl">
        <Reveal>
          <p className="mb-3 text-xs uppercase tracking-widest text-accent-soft">{study.client}</p>
          <h1 className="mb-6 text-4xl font-semibold tracking-tight">{study.title}</h1>
          <p className="mb-8 text-lg text-foreground/60">{study.summary}</p>
        </Reveal>

        {metrics && Object.keys(metrics).length > 0 && (
          <Reveal delay={0.1}>
            <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Object.entries(metrics).map(([label, value]) => (
                <GlassCard key={label} className="text-center">
                  <p className="text-2xl font-semibold text-accent-glow">{value}</p>
                  <p className="mt-1 text-xs text-foreground/50">{label}</p>
                </GlassCard>
              ))}
            </div>
          </Reveal>
        )}

        <Reveal delay={0.15}>
          <div className="whitespace-pre-wrap leading-relaxed text-foreground/70">{study.content}</div>
        </Reveal>
      </article>
    </main>
  );
}

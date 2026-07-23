import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Reveal from "@/components/Reveal";
import GlassCard from "@/components/GlassCard";
import { Star } from "lucide-react";

export const metadata: Metadata = { title: "Testimonials", description: "What people say after shipping on Apex Pulse." };
export const revalidate = 120;

export default async function TestimonialsPage() {
  const [testimonials, reviews] = await Promise.all([
    prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.review.findMany({ where: { isApproved: true }, orderBy: { createdAt: "desc" } }),
  ]);

  const all = [
    ...testimonials.map((t) => ({ id: t.id, name: t.authorName, role: t.authorRole, rating: t.rating, content: t.content })),
    ...reviews.map((r) => ({ id: r.id, name: r.authorName, role: null, rating: r.rating, content: r.comment })),
  ];

  return (
    <main className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <span className="mb-4 inline-block rounded-full border border-border bg-surface px-4 py-1.5 text-xs text-accent-soft">
            Testimonials
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">In their words</h1>
        </Reveal>
      </div>

      {all.length === 0 ? (
        <p className="mt-16 text-center text-foreground/50">
          No testimonials published yet.{" "}
          <a href="/contact" className="text-accent-soft hover:underline">Share yours</a>.
        </p>
      ) : (
        <div className="mx-auto mt-16 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {all.map((t, i) => (
            <Reveal key={t.id} delay={(i % 6) * 0.06}>
              <GlassCard className="h-full">
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <Star key={idx} size={14} className="fill-accent-glow text-accent-glow" />
                  ))}
                </div>
                <p className="mb-4 text-sm text-foreground/70">&ldquo;{t.content}&rdquo;</p>
                <p className="text-sm font-medium">{t.name}</p>
                {t.role && <p className="text-xs text-foreground/40">{t.role}</p>}
              </GlassCard>
            </Reveal>
          ))}
        </div>
      )}
    </main>
  );
}

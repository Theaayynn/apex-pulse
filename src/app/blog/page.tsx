import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Reveal from "@/components/Reveal";
import GlassCard from "@/components/GlassCard";

export const metadata: Metadata = { title: "Blog", description: "Notes on building Apex Pulse." };
export const revalidate = 120;

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <main className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <span className="mb-4 inline-block rounded-full border border-border bg-surface px-4 py-1.5 text-xs text-accent-soft">
            Blog
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Notes from the build</h1>
          <p className="mt-6 text-foreground/60">
            Engineering decisions, design rationale, and the occasional postmortem.
          </p>
        </Reveal>
      </div>

      {posts.length === 0 ? (
        <p className="mt-16 text-center text-foreground/50">
          No posts published yet — check back soon.
        </p>
      ) : (
        <div className="mx-auto mt-16 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.id} delay={i * 0.06}>
              <Link href={`/blog/${post.slug}`}>
                <GlassCard className="h-full">
                  <p className="mb-2 text-xs text-foreground/40">
                    {post.publishedAt?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <h2 className="mb-2 text-base font-medium">{post.title}</h2>
                  <p className="line-clamp-3 text-sm text-foreground/55">{post.excerpt}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full border border-border px-2 py-0.5 text-xs text-foreground/50">
                        {tag}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </main>
  );
}

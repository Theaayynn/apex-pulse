import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Reveal from "@/components/Reveal";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  return prisma.blogPost.findUnique({ where: { slug, isPublished: true } });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: post.coverImage ? [post.coverImage] : [] },
  };
}

export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({ where: { isPublished: true }, select: { slug: true } });
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <main className="px-6 pt-32 pb-24">
      <article className="mx-auto max-w-2xl">
        <Reveal>
          <p className="mb-3 text-xs text-foreground/40">
            {post.publishedAt?.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {post.authorName}
          </p>
          <h1 className="mb-8 text-4xl font-semibold tracking-tight">{post.title}</h1>
          <div className="whitespace-pre-wrap text-foreground/70 leading-relaxed">{post.content}</div>
        </Reveal>
      </article>
    </main>
  );
}

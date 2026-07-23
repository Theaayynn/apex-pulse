import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";
import { blogPostSchema } from "@/lib/validations/cms";

export async function GET() {
  const { error, status } = await requireAdminApi();
  if (error) return NextResponse.json({ error }, { status });

  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const { error, status, user } = await requireAdminApi();
  if (error || !user) return NextResponse.json({ error }, { status });

  const body = await req.json().catch(() => null);
  const parsed = blogPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const existing = await prisma.blogPost.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return NextResponse.json({ error: "A post with this slug already exists." }, { status: 409 });

  const { isPublished, coverImage, ...rest } = parsed.data;
  const post = await prisma.blogPost.create({
    data: {
      ...rest,
      coverImage: coverImage || undefined,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
    },
  });

  await prisma.auditLog.create({ data: { userId: user.id, action: "BLOG_POST_CREATED", entityType: "BlogPost", entityId: post.id } });

  return NextResponse.json({ message: "Post created.", post }, { status: 201 });
}

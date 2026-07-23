import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";
import { blogPostSchema } from "@/lib/validations/cms";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error, status, user } = await requireAdminApi();
  if (error || !user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = blogPostSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Post not found." }, { status: 404 });

  const { coverImage, isPublished, ...rest } = parsed.data;
  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      ...rest,
      ...(coverImage !== undefined ? { coverImage: coverImage || null } : {}),
      ...(isPublished !== undefined
        ? { isPublished, publishedAt: isPublished && !existing.publishedAt ? new Date() : existing.publishedAt }
        : {}),
    },
  });

  await prisma.auditLog.create({ data: { userId: user.id, action: "BLOG_POST_UPDATED", entityType: "BlogPost", entityId: id } });

  return NextResponse.json({ message: "Post updated.", post });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error, status, user } = await requireAdminApi();
  if (error || !user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  await prisma.blogPost.delete({ where: { id } }).catch(() => null);
  await prisma.auditLog.create({ data: { userId: user.id, action: "BLOG_POST_DELETED", entityType: "BlogPost", entityId: id } });

  return NextResponse.json({ message: "Post deleted." });
}

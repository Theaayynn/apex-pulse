import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";
import { z } from "zod";

const schema = z.object({ isApproved: z.boolean() });

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error, status, user } = await requireAdminApi();
  if (error || !user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const review = await prisma.review.update({ where: { id }, data: parsed.data }).catch(() => null);
  if (!review) return NextResponse.json({ error: "Review not found." }, { status: 404 });

  await prisma.auditLog.create({
    data: { userId: user.id, action: parsed.data.isApproved ? "REVIEW_APPROVED" : "REVIEW_REJECTED", entityType: "Review", entityId: id },
  });

  return NextResponse.json({ message: "Review updated.", review });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error, status, user } = await requireAdminApi();
  if (error || !user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  await prisma.review.delete({ where: { id } }).catch(() => null);
  await prisma.auditLog.create({ data: { userId: user.id, action: "REVIEW_DELETED", entityType: "Review", entityId: id } });

  return NextResponse.json({ message: "Review deleted." });
}

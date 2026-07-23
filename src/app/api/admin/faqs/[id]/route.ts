import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";
import { faqSchema } from "@/lib/validations/cms";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error, status, user } = await requireAdminApi();
  if (error || !user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = faqSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const faq = await prisma.fAQ.update({ where: { id }, data: parsed.data }).catch(() => null);
  if (!faq) return NextResponse.json({ error: "FAQ not found." }, { status: 404 });

  await prisma.auditLog.create({ data: { userId: user.id, action: "FAQ_UPDATED", entityType: "FAQ", entityId: id } });

  return NextResponse.json({ message: "FAQ updated.", faq });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error, status, user } = await requireAdminApi();
  if (error || !user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  await prisma.fAQ.delete({ where: { id } }).catch(() => null);
  await prisma.auditLog.create({ data: { userId: user.id, action: "FAQ_DELETED", entityType: "FAQ", entityId: id } });

  return NextResponse.json({ message: "FAQ deleted." });
}

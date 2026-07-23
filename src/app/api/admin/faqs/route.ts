import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";
import { faqSchema } from "@/lib/validations/cms";

export async function GET() {
  const { error, status } = await requireAdminApi();
  if (error) return NextResponse.json({ error }, { status });

  const faqs = await prisma.fAQ.findMany({ orderBy: [{ category: "asc" }, { order: "asc" }] });
  return NextResponse.json({ faqs });
}

export async function POST(req: NextRequest) {
  const { error, status, user } = await requireAdminApi();
  if (error || !user) return NextResponse.json({ error }, { status });

  const body = await req.json().catch(() => null);
  const parsed = faqSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { category, ...rest } = parsed.data;
  const faq = await prisma.fAQ.create({ data: { ...rest, category: category || undefined } });

  await prisma.auditLog.create({ data: { userId: user.id, action: "FAQ_CREATED", entityType: "FAQ", entityId: faq.id } });

  return NextResponse.json({ message: "FAQ created.", faq }, { status: 201 });
}

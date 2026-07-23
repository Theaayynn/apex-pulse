import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";
import { caseStudySchema } from "@/lib/validations/cms";
import { z } from "zod";

const createSchema = caseStudySchema.extend({
  metrics: z.record(z.string(), z.string()).optional(),
});

export async function GET() {
  const { error, status } = await requireAdminApi();
  if (error) return NextResponse.json({ error }, { status });

  const studies = await prisma.caseStudy.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ studies });
}

export async function POST(req: NextRequest) {
  const { error, status, user } = await requireAdminApi();
  if (error || !user) return NextResponse.json({ error }, { status });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const existing = await prisma.caseStudy.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return NextResponse.json({ error: "A case study with this slug already exists." }, { status: 409 });

  const { coverImage, metrics, ...rest } = parsed.data;
  const study = await prisma.caseStudy.create({
    data: { ...rest, coverImage: coverImage || undefined, metrics: metrics ?? undefined },
  });

  await prisma.auditLog.create({ data: { userId: user.id, action: "CASE_STUDY_CREATED", entityType: "CaseStudy", entityId: study.id } });

  return NextResponse.json({ message: "Case study created.", study }, { status: 201 });
}

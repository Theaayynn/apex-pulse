import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";
import { caseStudySchema } from "@/lib/validations/cms";
import { z } from "zod";

const updateSchema = caseStudySchema.partial().extend({
  metrics: z.record(z.string(), z.string()).optional(),
});

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error, status, user } = await requireAdminApi();
  if (error || !user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { coverImage, metrics, ...rest } = parsed.data;
  const study = await prisma.caseStudy
    .update({
      where: { id },
      data: {
        ...rest,
        ...(coverImage !== undefined ? { coverImage: coverImage || null } : {}),
        ...(metrics !== undefined ? { metrics } : {}),
      },
    })
    .catch(() => null);

  if (!study) return NextResponse.json({ error: "Case study not found." }, { status: 404 });

  await prisma.auditLog.create({ data: { userId: user.id, action: "CASE_STUDY_UPDATED", entityType: "CaseStudy", entityId: id } });

  return NextResponse.json({ message: "Case study updated.", study });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error, status, user } = await requireAdminApi();
  if (error || !user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  await prisma.caseStudy.delete({ where: { id } }).catch(() => null);
  await prisma.auditLog.create({ data: { userId: user.id, action: "CASE_STUDY_DELETED", entityType: "CaseStudy", entityId: id } });

  return NextResponse.json({ message: "Case study deleted." });
}

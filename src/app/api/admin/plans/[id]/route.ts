import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";
import { planSchema } from "@/lib/validations/cms";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error, status, user } = await requireAdminApi();
  if (error || !user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = planSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const plan = await prisma.plan.update({ where: { id }, data: parsed.data }).catch(() => null);
  if (!plan) return NextResponse.json({ error: "Plan not found." }, { status: 404 });

  await prisma.auditLog.create({ data: { userId: user.id, action: "PLAN_UPDATED", entityType: "Plan", entityId: id } });

  return NextResponse.json({ message: "Plan updated.", plan });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error, status, user } = await requireAdminApi();
  if (error || !user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  await prisma.plan.delete({ where: { id } }).catch(() => null);
  await prisma.auditLog.create({ data: { userId: user.id, action: "PLAN_DELETED", entityType: "Plan", entityId: id } });

  return NextResponse.json({ message: "Plan deleted." });
}

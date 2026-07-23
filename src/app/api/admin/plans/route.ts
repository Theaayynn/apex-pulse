import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";
import { planSchema } from "@/lib/validations/cms";

export async function GET() {
  const { error, status } = await requireAdminApi();
  if (error) return NextResponse.json({ error }, { status });

  const plans = await prisma.plan.findMany({ orderBy: { priceMonthly: "asc" } });
  return NextResponse.json({ plans });
}

export async function POST(req: NextRequest) {
  const { error, status, user } = await requireAdminApi();
  if (error || !user) return NextResponse.json({ error }, { status });

  const body = await req.json().catch(() => null);
  const parsed = planSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const existing = await prisma.plan.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return NextResponse.json({ error: "A plan with this slug already exists." }, { status: 409 });

  const plan = await prisma.plan.create({ data: parsed.data });
  await prisma.auditLog.create({ data: { userId: user.id, action: "PLAN_CREATED", entityType: "Plan", entityId: plan.id } });

  return NextResponse.json({ message: "Plan created.", plan }, { status: 201 });
}

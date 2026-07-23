import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";
import { couponSchema } from "@/lib/validations/cms";

export async function GET() {
  const { error, status } = await requireAdminApi();
  if (error) return NextResponse.json({ error }, { status });

  const coupons = await prisma.coupon.findMany({ orderBy: { code: "asc" } });
  return NextResponse.json({ coupons });
}

export async function POST(req: NextRequest) {
  const { error, status, user } = await requireAdminApi();
  if (error || !user) return NextResponse.json({ error }, { status });

  const body = await req.json().catch(() => null);
  const parsed = couponSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const existing = await prisma.coupon.findUnique({ where: { code: parsed.data.code } });
  if (existing) return NextResponse.json({ error: "A coupon with this code already exists." }, { status: 409 });

  const { expiresAt, ...rest } = parsed.data;
  const coupon = await prisma.coupon.create({
    data: { ...rest, expiresAt: expiresAt ? new Date(expiresAt) : undefined },
  });

  await prisma.auditLog.create({ data: { userId: user.id, action: "COUPON_CREATED", entityType: "Coupon", entityId: coupon.id } });

  return NextResponse.json({ message: "Coupon created.", coupon }, { status: 201 });
}

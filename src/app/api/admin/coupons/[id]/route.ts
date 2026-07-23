import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";
import { couponSchema } from "@/lib/validations/cms";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error, status, user } = await requireAdminApi();
  if (error || !user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = couponSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { expiresAt, ...rest } = parsed.data;
  const coupon = await prisma
    .coupon
    .update({ where: { id }, data: { ...rest, ...(expiresAt !== undefined ? { expiresAt: expiresAt ? new Date(expiresAt) : null } : {}) } })
    .catch(() => null);

  if (!coupon) return NextResponse.json({ error: "Coupon not found." }, { status: 404 });

  await prisma.auditLog.create({ data: { userId: user.id, action: "COUPON_UPDATED", entityType: "Coupon", entityId: id } });

  return NextResponse.json({ message: "Coupon updated.", coupon });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error, status, user } = await requireAdminApi();
  if (error || !user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  await prisma.coupon.delete({ where: { id } }).catch(() => null);
  await prisma.auditLog.create({ data: { userId: user.id, action: "COUPON_DELETED", entityType: "Coupon", entityId: id } });

  return NextResponse.json({ message: "Coupon deleted." });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";
import { testimonialSchema } from "@/lib/validations/cms";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error, status, user } = await requireAdminApi();
  if (error || !user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = testimonialSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const testimonial = await prisma.testimonial.update({ where: { id }, data: parsed.data }).catch(() => null);
  if (!testimonial) return NextResponse.json({ error: "Testimonial not found." }, { status: 404 });

  await prisma.auditLog.create({ data: { userId: user.id, action: "TESTIMONIAL_UPDATED", entityType: "Testimonial", entityId: id } });

  return NextResponse.json({ message: "Testimonial updated.", testimonial });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error, status, user } = await requireAdminApi();
  if (error || !user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  await prisma.testimonial.delete({ where: { id } }).catch(() => null);
  await prisma.auditLog.create({ data: { userId: user.id, action: "TESTIMONIAL_DELETED", entityType: "Testimonial", entityId: id } });

  return NextResponse.json({ message: "Testimonial deleted." });
}

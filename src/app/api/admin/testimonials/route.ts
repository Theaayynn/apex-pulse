import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";
import { testimonialSchema } from "@/lib/validations/cms";

export async function GET() {
  const { error, status } = await requireAdminApi();
  if (error) return NextResponse.json({ error }, { status });

  const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ testimonials });
}

export async function POST(req: NextRequest) {
  const { error, status, user } = await requireAdminApi();
  if (error || !user) return NextResponse.json({ error }, { status });

  const body = await req.json().catch(() => null);
  const parsed = testimonialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { avatarUrl, authorRole, ...rest } = parsed.data;
  const testimonial = await prisma.testimonial.create({
    data: { ...rest, avatarUrl: avatarUrl || undefined, authorRole: authorRole || undefined },
  });

  await prisma.auditLog.create({ data: { userId: user.id, action: "TESTIMONIAL_CREATED", entityType: "Testimonial", entityId: testimonial.id } });

  return NextResponse.json({ message: "Testimonial created.", testimonial }, { status: 201 });
}

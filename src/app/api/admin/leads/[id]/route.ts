import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";
import { z } from "zod";

const schema = z.object({ status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "LOST", "CONVERTED"]) });

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error, status, user } = await requireAdminApi();
  if (error || !user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const lead = await prisma.lead.update({ where: { id }, data: parsed.data }).catch(() => null);
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });

  await prisma.auditLog.create({ data: { userId: user.id, action: "LEAD_STATUS_UPDATED", entityType: "Lead", entityId: id, metadata: parsed.data } });

  return NextResponse.json({ message: "Lead updated.", lead });
}

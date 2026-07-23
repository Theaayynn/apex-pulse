import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  assigneeId: z.string().nullable().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
});

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { error, status } = await requireAdminApi(["SUPER_ADMIN", "ADMIN", "EMPLOYEE"]);
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!ticket) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  return NextResponse.json({ ticket });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error, status, user } = await requireAdminApi(["SUPER_ADMIN", "ADMIN", "EMPLOYEE"]);
  if (error || !user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const ticket = await prisma.supportTicket.update({ where: { id }, data: parsed.data }).catch(() => null);
  if (!ticket) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });

  await prisma.auditLog.create({
    data: { userId: user.id, action: "TICKET_UPDATED_BY_ADMIN", entityType: "SupportTicket", entityId: id, metadata: parsed.data },
  });

  return NextResponse.json({ message: "Ticket updated.", ticket });
}

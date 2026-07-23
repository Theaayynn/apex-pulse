import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";
import type { TicketStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { error, status } = await requireAdminApi(["SUPER_ADMIN", "ADMIN", "EMPLOYEE"]);
  if (error) return NextResponse.json({ error }, { status });

  const statusFilter = req.nextUrl.searchParams.get("status");
  const where = statusFilter ? { status: statusFilter as TicketStatus } : {};

  const tickets = await prisma.supportTicket.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      assignee: { select: { id: true, name: true } },
      _count: { select: { messages: true } },
    },
  });

  return NextResponse.json({ tickets });
}

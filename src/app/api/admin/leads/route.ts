import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";
import type { LeadStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { error, status } = await requireAdminApi();
  if (error) return NextResponse.json({ error }, { status });

  const statusFilter = req.nextUrl.searchParams.get("status");
  const formType = req.nextUrl.searchParams.get("formType");

  const where = {
    ...(statusFilter ? { status: statusFilter as LeadStatus } : {}),
    ...(formType ? { formType } : {}),
  };

  const leads = await prisma.lead.findMany({ where, orderBy: { createdAt: "desc" }, take: 200 });
  return NextResponse.json({ leads });
}

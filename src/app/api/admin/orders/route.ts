import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";
import type { OrderStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { error, status } = await requireAdminApi();
  if (error) return NextResponse.json({ error }, { status });

  const statusFilter = req.nextUrl.searchParams.get("status");
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? 1));
  const pageSize = 25;

  const where = statusFilter ? { status: statusFilter as OrderStatus } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { name: true, email: true } }, plan: true, invoice: true },
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({ orders, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
}

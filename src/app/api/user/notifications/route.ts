import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const payload = await getCurrentUser();
  if (!payload) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? 1));
  const pageSize = 20;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: payload.sub },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.notification.count({ where: { userId: payload.sub } }),
  ]);

  return NextResponse.json({
    notifications,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}

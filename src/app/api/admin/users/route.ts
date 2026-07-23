import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";
import type { Prisma, Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { error, status } = await requireAdminApi();
  if (error) return NextResponse.json({ error }, { status });

  const search = req.nextUrl.searchParams.get("search")?.trim();
  const role = req.nextUrl.searchParams.get("role");
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? 1));
  const pageSize = 20;

  const where: Prisma.UserWhereInput = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(role ? { role: role as Role } : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ users, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
}

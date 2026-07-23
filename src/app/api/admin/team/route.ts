import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";

export async function GET() {
  const { error, status } = await requireAdminApi(["SUPER_ADMIN", "ADMIN", "EMPLOYEE"]);
  if (error) return NextResponse.json({ error }, { status });

  const team = await prisma.user.findMany({
    where: { role: { in: ["SUPER_ADMIN", "ADMIN", "EMPLOYEE"] }, isActive: true },
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ team });
}

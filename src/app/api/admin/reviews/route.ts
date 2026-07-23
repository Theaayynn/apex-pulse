import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";

export async function GET() {
  const { error, status } = await requireAdminApi();
  if (error) return NextResponse.json({ error }, { status });

  const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ reviews });
}

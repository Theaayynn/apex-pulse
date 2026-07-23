import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 120;

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const plan = await prisma.plan.findUnique({ where: { slug, isActive: true } });
  if (!plan) return NextResponse.json({ error: "Plan not found." }, { status: 404 });
  return NextResponse.json({ plan });
}

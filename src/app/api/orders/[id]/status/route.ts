import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const payload = await getCurrentUser();
  if (!payload) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { plan: true } });

  if (!order || order.userId !== payload.sub) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ status: order.status, planName: order.plan?.name ?? null });
}

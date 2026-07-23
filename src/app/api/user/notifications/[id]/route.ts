import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(_req: NextRequest, { params }: Params) {
  const payload = await getCurrentUser();
  if (!payload) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { id } = await params;

  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== payload.sub) {
    return NextResponse.json({ error: "Notification not found." }, { status: 404 });
  }

  await prisma.notification.update({ where: { id }, data: { isRead: true } });

  return NextResponse.json({ message: "Marked as read." });
}

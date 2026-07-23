import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
  const payload = await getCurrentUser();
  if (!payload) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  await prisma.notification.updateMany({
    where: { userId: payload.sub, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ message: "All notifications marked as read." });
}

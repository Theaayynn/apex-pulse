import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokens";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = body?.token as string | undefined;

  if (!token) {
    return NextResponse.json({ error: "Verification token is required." }, { status: 400 });
  }

  const tokenHash = hashToken(token);

  const record = await prisma.token.findUnique({ where: { tokenHash } });

  if (
    !record ||
    record.type !== "EMAIL_VERIFICATION" ||
    record.usedAt ||
    record.expiresAt < new Date()
  ) {
    return NextResponse.json(
      { error: "This verification link is invalid or has expired." },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { isEmailVerified: true } }),
    prisma.token.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.auditLog.create({
      data: { userId: record.userId, action: "EMAIL_VERIFIED", entityType: "User", entityId: record.userId },
    }),
  ]);

  return NextResponse.json({ message: "Email verified successfully." });
}

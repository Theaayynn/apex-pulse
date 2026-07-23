import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, verifyPassword, clearAuthCookies } from "@/lib/auth";
import { deleteAccountSchema } from "@/lib/validations/user";

export async function DELETE(req: NextRequest) {
  const payload = await getCurrentUser();
  if (!payload) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = deleteAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const validPassword = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!validPassword) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 400 });
  }

  // Soft delete: deactivate rather than hard-delete, preserving order/invoice history
  // for accounting purposes. Sessions are revoked so the account is immediately unusable.
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        isActive: false,
        email: `deleted-${user.id}@apexpulse.invalid`,
      },
    }),
    prisma.session.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
    prisma.auditLog.create({
      data: { userId: user.id, action: "ACCOUNT_DELETED", entityType: "User", entityId: user.id },
    }),
  ]);

  await clearAuthCookies();

  return NextResponse.json({ message: "Account deleted." });
}

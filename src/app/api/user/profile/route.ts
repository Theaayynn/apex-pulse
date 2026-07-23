import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/validations/user";

export async function GET() {
  const payload = await getCurrentUser();
  if (!payload) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, phone: true, avatarUrl: true, role: true, isEmailVerified: true, createdAt: true },
  });

  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const payload = await getCurrentUser();
  if (!payload) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, phone } = parsed.data;

  const user = await prisma.user.update({
    where: { id: payload.sub },
    data: { name, phone: phone || null },
    select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
  });

  await prisma.auditLog.create({
    data: { userId: payload.sub, action: "PROFILE_UPDATED", entityType: "User", entityId: payload.sub },
  });

  return NextResponse.json({ message: "Profile updated.", user });
}

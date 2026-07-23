import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";
import { z } from "zod";

const updateUserSchema = z.object({
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EMPLOYEE", "CUSTOMER"]).optional(),
  isActive: z.boolean().optional(),
});

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error, status, user: admin } = await requireAdminApi();
  if (error || !admin) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Privilege-escalation guard: only SUPER_ADMIN can grant/modify ADMIN or SUPER_ADMIN roles,
  // and only SUPER_ADMIN can deactivate another admin-level account.
  const touchesAdminRole =
    parsed.data.role === "ADMIN" ||
    parsed.data.role === "SUPER_ADMIN" ||
    target.role === "ADMIN" ||
    target.role === "SUPER_ADMIN";

  if (touchesAdminRole && admin.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only a Super Admin can modify admin-level accounts." }, { status: 403 });
  }

  if (target.id === admin.id && parsed.data.isActive === false) {
    return NextResponse.json({ error: "You cannot deactivate your own account." }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: parsed.data,
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "USER_UPDATED_BY_ADMIN",
      entityType: "User",
      entityId: id,
      metadata: parsed.data,
    },
  });

  return NextResponse.json({ message: "User updated.", user: updated });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error, status, user: admin } = await requireAdminApi(["SUPER_ADMIN"]);
  if (error || !admin) return NextResponse.json({ error }, { status });

  const { id } = await params;
  if (id === admin.id) {
    return NextResponse.json({ error: "You cannot deactivate your own account." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { isActive: false } }),
    prisma.session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } }),
    prisma.auditLog.create({
      data: { userId: admin.id, action: "USER_DEACTIVATED_BY_ADMIN", entityType: "User", entityId: id },
    }),
  ]);

  return NextResponse.json({ message: "User deactivated." });
}

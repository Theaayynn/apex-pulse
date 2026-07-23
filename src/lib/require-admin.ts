import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

/** Use inside an /admin server page. Redirects if not authenticated or not an admin-level role. */
export async function requireAdmin(allowed: Role[] = ["SUPER_ADMIN", "ADMIN"]) {
  const payload = await getCurrentUser();
  if (!payload) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) redirect("/login");
  if (!allowed.includes(user.role)) redirect("/dashboard");

  return user;
}

/** Use inside an /api/admin route handler. Returns the user or a 401/403 NextResponse-shaped error. */
export async function requireAdminApi(allowed: Role[] = ["SUPER_ADMIN", "ADMIN"]) {
  const payload = await getCurrentUser();
  if (!payload) return { error: "Not authenticated.", status: 401 as const, user: null };

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) return { error: "Not authenticated.", status: 401 as const, user: null };
  if (!allowed.includes(user.role)) return { error: "Forbidden.", status: 403 as const, user: null };

  return { error: null, status: 200 as const, user };
}

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Use inside a server component/page. Redirects to /login if not authenticated or inactive. */
export async function requireUser() {
  const payload = await getCurrentUser();
  if (!payload) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) redirect("/login");

  return user;
}

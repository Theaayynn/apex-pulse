import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clearAuthCookies, getRefreshTokenFromCookies } from "@/lib/auth";

export async function POST() {
  const refreshToken = await getRefreshTokenFromCookies();

  if (refreshToken) {
    await prisma.session
      .updateMany({
        where: { refreshToken, revokedAt: null },
        data: { revokedAt: new Date() },
      })
      .catch(() => null);
  }

  await clearAuthCookies();

  return NextResponse.json({ message: "Logged out successfully." });
}

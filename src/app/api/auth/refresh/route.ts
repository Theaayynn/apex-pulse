import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getRefreshTokenFromCookies,
  verifyRefreshToken,
  signAccessToken,
  setAuthCookies,
  clearAuthCookies,
} from "@/lib/auth";

export async function POST() {
  const refreshToken = await getRefreshTokenFromCookies();
  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token." }, { status: 401 });
  }

  try {
    const { sub: userId } = verifyRefreshToken(refreshToken);

    const session = await prisma.session.findUnique({ where: { refreshToken } });
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      await clearAuthCookies();
      return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      await clearAuthCookies();
      return NextResponse.json({ error: "Account not available." }, { status: 401 });
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
    // Reuse the same refresh token (rotation optional — could reissue + update session here).
    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json({ message: "Token refreshed." });
  } catch {
    await clearAuthCookies();
    return NextResponse.json({ error: "Invalid refresh token." }, { status: 401 });
  }
}

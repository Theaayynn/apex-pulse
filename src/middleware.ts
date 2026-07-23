import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import type { Role } from "@prisma/client";

const encodedSecret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET as string);

const ACCESS_COOKIE = "apex_access_token";

// Routes and the roles allowed to access them. First matching prefix wins.
const PROTECTED_ROUTES: { prefix: string; roles: Role[] }[] = [
  { prefix: "/admin", roles: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/employee", roles: ["SUPER_ADMIN", "ADMIN", "EMPLOYEE"] },
  { prefix: "/dashboard", roles: ["SUPER_ADMIN", "ADMIN", "EMPLOYEE", "CUSTOMER"] },
  { prefix: "/checkout", roles: ["SUPER_ADMIN", "ADMIN", "EMPLOYEE", "CUSTOMER"] },
];

const AUTH_PAGES = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(ACCESS_COOKIE)?.value;

  const matchedRoute = PROTECTED_ROUTES.find((r) => pathname.startsWith(r.prefix));

  let payload: { sub: string; role: Role; email: string } | null = null;
  if (token) {
    try {
      const { payload: verified } = await jwtVerify(token, encodedSecret);
      payload = verified as unknown as { sub: string; role: Role; email: string };
    } catch {
      payload = null;
    }
  }

  // Redirect logged-in users away from login/register pages.
  if (AUTH_PAGES.includes(pathname) && payload) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (matchedRoute) {
    if (!payload) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!matchedRoute.roles.includes(payload.role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/employee/:path*",
    "/dashboard/:path*",
    "/checkout/:path*",
    "/login",
    "/register",
  ],
};

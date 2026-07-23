import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validations/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { generateToken } from "@/lib/tokens";
import { sendEmail, verifyEmailTemplate } from "@/lib/email";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const limit = rateLimit(`register:${ip}`, { windowMs: 60 * 60 * 1000, max: 10 });
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many registration attempts. Try again later." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Do not reveal which emails exist — generic message.
    return NextResponse.json(
      { error: "Unable to register with these details." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "CUSTOMER" },
  });

  const { plain, hash } = generateToken();
  await prisma.token.create({
    data: {
      userId: user.id,
      type: "EMAIL_VERIFICATION",
      tokenHash: hash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${plain}`;
  await sendEmail({
    to: user.email,
    subject: "Verify your Apex Pulse account",
    html: verifyEmailTemplate(user.name, verifyUrl),
  }).catch((err) => console.error("[register] Failed to send verification email:", err));

  await prisma.auditLog.create({
    data: { userId: user.id, action: "USER_REGISTERED", entityType: "User", entityId: user.id, ipAddress: ip },
  });

  return NextResponse.json(
    {
      message: "Account created. Check your email to verify your account.",
      user: { id: user.id, name: user.name, email: user.email },
    },
    { status: 201 }
  );
}

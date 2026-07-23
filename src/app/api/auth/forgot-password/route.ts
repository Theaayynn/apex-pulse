import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { generateToken } from "@/lib/tokens";
import { sendEmail, resetPasswordTemplate } from "@/lib/email";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const limit = rateLimit(`forgot-password:${ip}`, { windowMs: 60 * 60 * 1000, max: 10 });
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return the same response, whether or not the account exists,
  // so this endpoint can't be used to enumerate registered emails.
  const genericResponse = NextResponse.json({
    message: "If an account exists for that email, a reset link has been sent.",
  });

  if (!user) return genericResponse;

  const { plain, hash } = generateToken();
  await prisma.token.create({
    data: {
      userId: user.id,
      type: "PASSWORD_RESET",
      tokenHash: hash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${plain}`;
  await sendEmail({
    to: user.email,
    subject: "Reset your Apex Pulse password",
    html: resetPasswordTemplate(user.name, resetUrl),
  }).catch((err) => console.error("[forgot-password] Failed to send email:", err));

  return genericResponse;
}

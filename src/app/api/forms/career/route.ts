import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { careerSchema } from "@/lib/validations/forms";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail, adminFormNotificationTemplate } from "@/lib/email";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const limit = rateLimit(`career:${ip}`, { windowMs: 60 * 60 * 1000, max: 10 });
  if (!limit.success) {
    return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = careerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const application = await prisma.careerApplication.create({ data: parsed.data });

  if (process.env.ADMIN_EMAIL) {
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New application: ${parsed.data.position}`,
      html: adminFormNotificationTemplate("career application", parsed.data),
    }).catch((err) => console.error("[career] Admin notification failed:", err));
  }

  return NextResponse.json(
    { message: "Application received. We'll review it and reach out.", id: application.id },
    { status: 201 }
  );
}

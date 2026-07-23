import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callbackSchema } from "@/lib/validations/forms";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail, adminFormNotificationTemplate } from "@/lib/email";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const limit = rateLimit(`callback:${ip}`, { windowMs: 60 * 60 * 1000, max: 15 });
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = callbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, phone, email, preferredTime } = parsed.data;

  const lead = await prisma.lead.create({
    data: {
      formType: "callback",
      name,
      email: email || "not-provided@apexpulse.com",
      phone,
      message: preferredTime ? `Preferred time: ${preferredTime}` : "Requested a callback",
      metadata: preferredTime ? { preferredTime } : undefined,
    },
  });

  if (process.env.ADMIN_EMAIL) {
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `Callback requested by ${name}`,
      html: adminFormNotificationTemplate("callback request", { name, phone, email, preferredTime }),
    }).catch((err) => console.error("[callback] Admin notification failed:", err));
  }

  return NextResponse.json({ message: "We'll call you back soon.", id: lead.id }, { status: 201 });
}

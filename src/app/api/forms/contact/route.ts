import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validations/forms";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail, adminFormNotificationTemplate } from "@/lib/email";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const limit = rateLimit(`contact:${ip}`, { windowMs: 60 * 60 * 1000, max: 15 });
  if (!limit.success) {
    return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    // Honeypot triggered (or any other validation failure) — respond generically, don't leak detection.
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, email, phone, message } = parsed.data;

  const lead = await prisma.lead.create({
    data: { formType: "contact", name, email, phone, message },
  });

  if (process.env.ADMIN_EMAIL) {
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New contact form submission from ${name}`,
      html: adminFormNotificationTemplate("contact", { name, email, phone, message }),
    }).catch((err) => console.error("[contact] Admin notification failed:", err));
  }

  return NextResponse.json({ message: "Thanks — we'll get back to you shortly.", id: lead.id }, { status: 201 });
}

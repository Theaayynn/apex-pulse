import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { complaintSchema } from "@/lib/validations/forms";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail, adminFormNotificationTemplate } from "@/lib/email";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const limit = rateLimit(`complaint:${ip}`, { windowMs: 60 * 60 * 1000, max: 10 });
  if (!limit.success) {
    return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = complaintSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, email, message } = parsed.data;

  const lead = await prisma.lead.create({
    data: { formType: "complaint", name, email, message },
  });

  if (process.env.ADMIN_EMAIL) {
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `⚠ New complaint from ${name}`,
      html: adminFormNotificationTemplate("complaint", { name, email, message }),
    }).catch((err) => console.error("[complaint] Admin notification failed:", err));
  }

  return NextResponse.json(
    { message: "We've logged your complaint and will follow up shortly.", id: lead.id },
    { status: 201 }
  );
}

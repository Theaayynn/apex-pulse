import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/validations/forms";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail, adminFormNotificationTemplate } from "@/lib/email";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const limit = rateLimit(`lead:${ip}`, { windowMs: 60 * 60 * 1000, max: 15 });
  if (!limit.success) {
    return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const lead = await prisma.lead.create({ data: { formType: "lead", ...parsed.data } });

  if (process.env.ADMIN_EMAIL) {
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New lead: ${parsed.data.name}`,
      html: adminFormNotificationTemplate("lead", parsed.data),
    }).catch((err) => console.error("[lead] Admin notification failed:", err));
  }

  return NextResponse.json({ message: "Thanks — our team will be in touch.", id: lead.id }, { status: 201 });
}

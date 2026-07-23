import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createTicketSchema } from "@/lib/validations/user";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail, adminFormNotificationTemplate } from "@/lib/email";

export async function GET() {
  const payload = await getCurrentUser();
  if (!payload) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: payload.sub },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { messages: true } } },
  });

  return NextResponse.json({ tickets });
}

export async function POST(req: NextRequest) {
  const payload = await getCurrentUser();
  if (!payload) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const limit = rateLimit(`create-ticket:${payload.sub}`, { windowMs: 60 * 60 * 1000, max: 15 });
  if (!limit.success) {
    return NextResponse.json({ error: "Too many tickets created. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createTicketSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const ticket = await prisma.supportTicket.create({
    data: { userId: payload.sub, ...parsed.data },
  });

  await prisma.ticketMessage.create({
    data: { ticketId: ticket.id, senderId: payload.sub, message: parsed.data.description },
  });

  if (process.env.ADMIN_EMAIL) {
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New support ticket: ${parsed.data.subject}`,
      html: adminFormNotificationTemplate("support ticket", {
        subject: parsed.data.subject,
        priority: parsed.data.priority,
        description: parsed.data.description,
      }),
    }).catch((err) => console.error("[support] Admin notification failed:", err));
  }

  return NextResponse.json({ message: "Ticket created.", ticket }, { status: 201 });
}

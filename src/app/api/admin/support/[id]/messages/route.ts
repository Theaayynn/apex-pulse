import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";
import { ticketMessageSchema } from "@/lib/validations/user";
import { sendEmail, ticketReplyTemplate } from "@/lib/email";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  const { error, status, user } = await requireAdminApi(["SUPER_ADMIN", "ADMIN", "EMPLOYEE"]);
  if (error || !user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const ticket = await prisma.supportTicket.findUnique({ where: { id }, include: { user: true } });
  if (!ticket) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = ticketMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const message = await prisma.ticketMessage.create({
    data: { ticketId: id, senderId: user.id, message: parsed.data.message },
  });

  // Move to in-progress automatically on the first admin reply if still open.
  await prisma.supportTicket.update({
    where: { id },
    data: { status: ticket.status === "OPEN" ? "IN_PROGRESS" : ticket.status, updatedAt: new Date() },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  await sendEmail({
    to: ticket.user.email,
    subject: `Reply to your ticket: ${ticket.subject}`,
    html: ticketReplyTemplate(ticket.user.name, ticket.subject, parsed.data.message, `${appUrl}/dashboard/support/${id}`),
  }).catch((err) => console.error("[admin support] Customer notification failed:", err));

  return NextResponse.json({ message: "Reply sent.", ticketMessage: message }, { status: 201 });
}

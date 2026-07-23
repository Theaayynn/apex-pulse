import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ticketMessageSchema } from "@/lib/validations/user";
import { rateLimit } from "@/lib/rate-limit";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  const payload = await getCurrentUser();
  if (!payload) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { id } = await params;

  const limit = rateLimit(`ticket-reply:${payload.sub}`, { windowMs: 15 * 60 * 1000, max: 30 });
  if (!limit.success) {
    return NextResponse.json({ error: "Too many messages sent. Slow down a little." }, { status: 429 });
  }

  const ticket = await prisma.supportTicket.findUnique({ where: { id } });
  if (!ticket || ticket.userId !== payload.sub) {
    return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }

  if (ticket.status === "CLOSED") {
    return NextResponse.json({ error: "This ticket is closed. Open a new ticket if you need further help." }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = ticketMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const message = await prisma.ticketMessage.create({
    data: { ticketId: id, senderId: payload.sub, message: parsed.data.message },
  });

  // Re-open the ticket if the customer replies after it was marked resolved.
  await prisma.supportTicket.update({
    where: { id },
    data: { status: ticket.status === "RESOLVED" ? "OPEN" : ticket.status, updatedAt: new Date() },
  });

  return NextResponse.json({ message: "Reply sent.", ticketMessage: message }, { status: 201 });
}

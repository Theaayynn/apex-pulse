import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { newsletterSchema } from "@/lib/validations/forms";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const limit = rateLimit(`newsletter:${ip}`, { windowMs: 60 * 60 * 1000, max: 20 });
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { email } = parsed.data;

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { isSubscribed: true },
    create: { email },
  });

  return NextResponse.json({ message: "Subscribed. Welcome aboard." }, { status: 201 });
}

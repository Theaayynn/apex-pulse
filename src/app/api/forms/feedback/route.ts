import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { feedbackSchema } from "@/lib/validations/forms";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const limit = rateLimit(`feedback:${ip}`, { windowMs: 60 * 60 * 1000, max: 15 });
  if (!limit.success) {
    return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, email, message, rating } = parsed.data;

  // Feedback becomes a Review, pending admin approval before it appears publicly.
  const review = await prisma.review.create({
    data: {
      authorName: name,
      rating: rating ?? 5,
      comment: message,
      isApproved: false,
    },
  });

  await prisma.lead.create({
    data: { formType: "feedback", name, email, message },
  });

  return NextResponse.json(
    { message: "Thanks for the feedback — it means a lot.", id: review.id },
    { status: 201 }
  );
}

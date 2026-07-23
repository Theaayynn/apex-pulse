import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { applyCoupon } from "@/lib/pricing";
import { checkoutInitSchema } from "@/lib/validations/payments";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const payload = await getCurrentUser();
  if (!payload) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  if (!stripeConfigured) {
    return NextResponse.json(
      { error: "Stripe isn't configured yet. Set STRIPE_SECRET_KEY (and the publishable key) in your environment." },
      { status: 503 }
    );
  }

  const limit = rateLimit(`stripe-checkout:${payload.sub}`, { windowMs: 60 * 60 * 1000, max: 20 });
  if (!limit.success) {
    return NextResponse.json({ error: "Too many checkout attempts. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = checkoutInitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { planSlug, cycle, couponCode } = parsed.data;

  const plan = await prisma.plan.findUnique({ where: { slug: planSlug, isActive: true } });
  if (!plan) return NextResponse.json({ error: "Plan not found." }, { status: 404 });

  const baseAmount = cycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
  const { breakdown, error: couponError } = await applyCoupon(baseAmount, couponCode);
  if (couponCode && couponError) {
    return NextResponse.json({ error: couponError }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: {
      userId: payload.sub,
      planId: plan.id,
      couponId: breakdown.couponId,
      amount: breakdown.finalAmount,
      currency: plan.currency,
      status: "PENDING",
      gateway: "STRIPE",
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: payload.email,
    line_items: [
      {
        price_data: {
          currency: plan.currency.toLowerCase(),
          product_data: { name: `${plan.name} (${cycle})` },
          unit_amount: breakdown.finalAmount,
        },
        quantity: 1,
      },
    ],
    metadata: { orderId: order.id },
    success_url: `${appUrl}/checkout/success?order=${order.id}`,
    cancel_url: `${appUrl}/checkout/cancel?order=${order.id}`,
  });

  await prisma.order.update({ where: { id: order.id }, data: { gatewayOrderId: session.id } });

  return NextResponse.json({ url: session.url });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { razorpay, razorpayConfigured } from "@/lib/razorpay";
import { applyCoupon } from "@/lib/pricing";
import { checkoutInitSchema } from "@/lib/validations/payments";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const payload = await getCurrentUser();
  if (!payload) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  if (!razorpayConfigured) {
    return NextResponse.json(
      { error: "Razorpay isn't configured yet. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment." },
      { status: 503 }
    );
  }

  const limit = rateLimit(`razorpay-order:${payload.sub}`, { windowMs: 60 * 60 * 1000, max: 20 });
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
      gateway: "RAZORPAY",
    },
  });

  const rzpOrder = await razorpay.orders.create({
    amount: breakdown.finalAmount,
    currency: plan.currency,
    receipt: order.id,
    notes: { orderId: order.id },
  });

  await prisma.order.update({ where: { id: order.id }, data: { gatewayOrderId: rzpOrder.id } });

  return NextResponse.json({
    orderId: order.id,
    razorpayOrderId: rzpOrder.id,
    amount: breakdown.finalAmount,
    currency: plan.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
}

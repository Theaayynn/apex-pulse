import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { razorpayConfigured } from "@/lib/razorpay";
import { finalizeOrderPayment } from "@/lib/orders";
import { razorpayVerifySchema } from "@/lib/validations/payments";

export async function POST(req: NextRequest) {
  const payload = await getCurrentUser();
  if (!payload) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  if (!razorpayConfigured) {
    return NextResponse.json({ error: "Razorpay isn't configured." }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const parsed = razorpayVerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = parsed.data;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== payload.sub) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (order.gatewayOrderId !== razorpay_order_id) {
    return NextResponse.json({ error: "Order mismatch." }, { status: 400 });
  }

  const expectedSignature = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    await prisma.order.update({ where: { id: orderId }, data: { status: "FAILED" } });
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  const finalized = await finalizeOrderPayment({
    orderId,
    gateway: "RAZORPAY",
    gatewayPaymentId: razorpay_payment_id,
    rawPayload: { razorpay_order_id, razorpay_payment_id },
  });

  return NextResponse.json({ message: "Payment verified.", invoiceNumber: finalized?.invoice?.invoiceNumber });
}

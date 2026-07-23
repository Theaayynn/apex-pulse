import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";
import { finalizeOrderPayment } from "@/lib/orders";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers.get("x-razorpay-signature");

  if (!webhookSecret || !signature) {
    return NextResponse.json({ error: "Missing webhook signature configuration." }, { status: 400 });
  }

  const rawBody = await req.text();

  const expectedSignature = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  if (expectedSignature !== signature) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "payment.captured") {
    const payment = event.payload?.payment?.entity;
    const orderId = payment?.notes?.orderId;
    const paymentId = payment?.id;
    if (orderId && paymentId) {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (order) {
        await finalizeOrderPayment({ orderId, gateway: "RAZORPAY", gatewayPaymentId: paymentId, rawPayload: payment });
      }
    }
  }

  return NextResponse.json({ received: true });
}

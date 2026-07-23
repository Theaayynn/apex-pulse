import { NextRequest, NextResponse } from "next/server";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { finalizeOrderPayment, markOrderFailed } from "@/lib/orders";
import type Stripe from "stripe";

// Stripe requires the raw request body to verify the webhook signature — Next.js Route
// Handlers don't parse the body automatically, so req.text() gives us the raw bytes.
export async function POST(req: NextRequest) {
  if (!stripeConfigured) {
    return NextResponse.json({ error: "Stripe isn't configured." }, { status: 503 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");

  if (!webhookSecret || !signature) {
    return NextResponse.json({ error: "Missing webhook signature configuration." }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
      if (orderId && paymentIntentId) {
        await finalizeOrderPayment({ orderId, gateway: "STRIPE", gatewayPaymentId: paymentIntentId, rawPayload: session });
      }
      break;
    }
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (orderId) await markOrderFailed(orderId);
      break;
    }
    default:
      // Unhandled event types are ignored — Stripe sends many we don't need to act on.
      break;
  }

  return NextResponse.json({ received: true });
}

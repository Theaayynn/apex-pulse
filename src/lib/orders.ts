import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber } from "@/lib/pricing";
import { sendEmail, orderConfirmationTemplate } from "@/lib/email";
import type { PaymentGateway } from "@prisma/client";

interface FinalizeArgs {
  orderId: string;
  gateway: PaymentGateway;
  gatewayPaymentId: string;
  rawPayload?: unknown;
}

/**
 * Marks an order PAID, records the Payment, generates an Invoice, increments coupon
 * redemption, sends a confirmation email, and creates an in-app notification.
 *
 * Idempotent: safe to call multiple times for the same order (e.g. webhook retries) —
 * if the order is already PAID, this is a no-op.
 */
export async function finalizeOrderPayment({ orderId, gateway, gatewayPaymentId, rawPayload }: FinalizeArgs) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true, plan: true, coupon: true, invoice: true },
  });

  if (!order) {
    console.error(`[finalizeOrderPayment] Order ${orderId} not found.`);
    return null;
  }

  if (order.status === "PAID" && order.invoice) {
    // Already processed — likely a webhook retry.
    return order;
  }

  const invoiceNumber = await generateInvoiceNumber();

  const [, , invoice] = await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status: "PAID", gateway } }),
    prisma.payment.create({
      data: {
        orderId,
        gateway,
        gatewayPaymentId,
        amount: order.amount,
        currency: order.currency,
        status: "succeeded",
        rawPayload: rawPayload ? JSON.parse(JSON.stringify(rawPayload)) : undefined,
      },
    }),
    prisma.invoice.create({
      data: {
        orderId,
        userId: order.userId,
        invoiceNumber,
        status: "PAID",
        amount: order.amount,
        currency: order.currency,
      },
    }),
    ...(order.couponId ? [prisma.coupon.update({ where: { id: order.couponId }, data: { redeemedCount: { increment: 1 } } })] : []),
    prisma.notification.create({
      data: {
        userId: order.userId,
        title: "Payment received",
        body: `Your payment for the ${order.plan?.name ?? "selected"} plan was successful.`,
        channel: "EMAIL",
      },
    }),
    prisma.auditLog.create({
      data: { userId: order.userId, action: "ORDER_PAID", entityType: "Order", entityId: orderId, metadata: { gateway, gatewayPaymentId } },
    }),
  ]);

  await sendEmail({
    to: order.user.email,
    subject: `Payment confirmed — ${invoiceNumber}`,
    html: orderConfirmationTemplate(
      order.user.name,
      order.plan?.name ?? "selected",
      invoiceNumber,
      `${(order.amount / 100).toLocaleString()} ${order.currency}`
    ),
  }).catch((err) => console.error("[finalizeOrderPayment] Confirmation email failed:", err));

  return { ...order, invoice };
}

export async function markOrderFailed(orderId: string) {
  await prisma.order.update({ where: { id: orderId }, data: { status: "FAILED" } }).catch(() => null);
}

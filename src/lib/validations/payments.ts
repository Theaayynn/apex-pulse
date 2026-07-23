import { z } from "zod";

export const checkoutInitSchema = z.object({
  planSlug: z.string().trim().min(1),
  cycle: z.enum(["monthly", "yearly"]),
  couponCode: z.string().trim().max(30).optional(),
});

export const razorpayVerifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  orderId: z.string().min(1),
});

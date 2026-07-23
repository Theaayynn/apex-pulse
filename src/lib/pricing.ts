import { prisma } from "@/lib/prisma";

export interface PriceBreakdown {
  baseAmount: number; // smallest currency unit
  discount: number;
  finalAmount: number;
  couponId: string | null;
}

/**
 * Validates a coupon code against a base amount and returns the discounted price.
 * Returns null discount info (no coupon applied) if the code is missing/invalid/expired/exhausted,
 * along with a human-readable reason so the caller can show it to the user.
 */
export async function applyCoupon(baseAmount: number, code?: string | null): Promise<{
  breakdown: PriceBreakdown;
  error: string | null;
}> {
  if (!code) {
    return { breakdown: { baseAmount, discount: 0, finalAmount: baseAmount, couponId: null }, error: null };
  }

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase().trim() } });

  if (!coupon || !coupon.isActive) {
    return { breakdown: { baseAmount, discount: 0, finalAmount: baseAmount, couponId: null }, error: "Invalid or inactive coupon code." };
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { breakdown: { baseAmount, discount: 0, finalAmount: baseAmount, couponId: null }, error: "This coupon has expired." };
  }
  if (coupon.maxRedemptions && coupon.redeemedCount >= coupon.maxRedemptions) {
    return { breakdown: { baseAmount, discount: 0, finalAmount: baseAmount, couponId: null }, error: "This coupon has reached its redemption limit." };
  }

  const discount =
    coupon.discountType === "PERCENT"
      ? Math.round((baseAmount * coupon.discountValue) / 100)
      : Math.min(coupon.discountValue * 100, baseAmount); // discountValue stored as whole currency units for FLAT

  const finalAmount = Math.max(0, baseAmount - discount);

  return { breakdown: { baseAmount, discount, finalAmount, couponId: coupon.id }, error: null };
}

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count({ where: { invoiceNumber: { startsWith: `INV-${year}-` } } });
  const next = (count + 1).toString().padStart(4, "0");
  return `INV-${year}-${next}`;
}

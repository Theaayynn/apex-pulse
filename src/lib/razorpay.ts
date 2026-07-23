import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

export const razorpayConfigured = Boolean(keyId && keySecret);

export const razorpay = razorpayConfigured
  ? new Razorpay({ key_id: keyId as string, key_secret: keySecret as string })
  : (null as unknown as Razorpay);

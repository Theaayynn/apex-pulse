import { randomBytes, createHash } from "crypto";

/** Returns [plainToken, hashedToken]. Store the hash, email/send the plain value. */
export function generateToken(): { plain: string; hash: string } {
  const plain = randomBytes(32).toString("hex");
  const hash = createHash("sha256").update(plain).digest("hex");
  return { plain, hash };
}

export function hashToken(plain: string): string {
  return createHash("sha256").update(plain).digest("hex");
}

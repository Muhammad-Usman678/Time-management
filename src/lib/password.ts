import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

// Password hashing with Node's built-in scrypt (no external dependency).
// Stored format: "<salt-hex>:<hash-hex>". Comparison is constant-time.

const KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string | null): boolean {
  if (!stored) return false;
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const hashBuf = Buffer.from(hashHex, "hex");
  const testBuf = scryptSync(password, salt, KEYLEN);
  return hashBuf.length === testBuf.length && timingSafeEqual(hashBuf, testBuf);
}

/** Opaque, unguessable session token stored in the DB + httpOnly cookie. */
export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

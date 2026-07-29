import { createHmac } from "node:crypto";

/**
 * HMAC-SHA256 hex digest of `value` keyed by `secret`. Returns null when no
 * secret is configured rather than falling back to a weak/unkeyed hash —
 * callers must treat a null result as "hashing unavailable", not as an
 * empty hash.
 */
export function hashValue(secret: string | undefined, value: string): string | null {
  if (!secret) return null;
  return createHmac("sha256", secret).update(value).digest("hex");
}

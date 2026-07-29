import { timingSafeEqual } from "node:crypto";
import { hashValue } from "@/server/downloads/hash";

/**
 * Signed, expiring grant proving a visitor completed the email-gate for a
 * specific product+file. Unlike `hashValue` (defense-in-depth, safe to skip
 * when unconfigured), the secret here IS the access control — productId and
 * fileId are not secret, so an unsigned or unverified token would let anyone
 * view a gated template without ever submitting the form. `mintViewGrant`
 * therefore throws rather than degrading, and `verifyViewGrant` treats a
 * missing secret as an automatic failure, never a bypass.
 */

function signPayload(secret: string, payload: string): string {
  const digest = hashValue(secret, payload);
  if (!digest) throw new Error("mintViewGrant: failed to sign payload");
  return digest;
}

export function mintViewGrant(
  secret: string | undefined,
  payload: { productId: string; fileId: string },
  ttlSeconds: number,
): string {
  if (!secret) {
    throw new Error("mintViewGrant: DOWNLOAD_HASH_SECRET is required to mint a view grant");
  }
  const expiresAt = Date.now() + ttlSeconds * 1000;
  const message = `${payload.productId}.${payload.fileId}.${expiresAt}`;
  const signature = signPayload(secret, message);
  return `${message}.${signature}`;
}

export function verifyViewGrant(
  token: string | undefined,
  secret: string | undefined,
  expected: { productId: string; fileId: string },
): boolean {
  if (!token || !secret) return false;

  const parts = token.split(".");
  if (parts.length !== 4) return false;
  const [productId, fileId, expiresAtRaw, signature] = parts as [string, string, string, string];

  if (productId !== expected.productId || fileId !== expected.fileId) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  const message = `${productId}.${fileId}.${expiresAtRaw}`;
  const expectedSignature = signPayload(secret, message);

  const provided = Buffer.from(signature, "hex");
  const expectedBuf = Buffer.from(expectedSignature, "hex");
  if (provided.length !== expectedBuf.length) return false;
  return timingSafeEqual(provided, expectedBuf);
}

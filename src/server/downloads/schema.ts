import { z } from "zod";

/**
 * Accepts any 8-4-4-4-12 hex-grouped id, not just RFC4122-compliant UUIDs.
 * z.uuid() enforces the version/variant nibbles, but this codebase's ids
 * (scripts/lib/deterministic-uuid.ts) are content-derived hashes reshaped
 * into UUID grouping, not real UUIDv4 — Postgres's uuid column type accepts
 * them too, it's only zod's stricter format check that doesn't.
 */
const uuidLike = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "Invalid id");

/**
 * Request body for POST /api/downloads/free (spec §20.1).
 */
export const downloadRequestSchema = z.object({
  productId: uuidLike,
  fileId: uuidLike,
  email: z.email().optional(),
  marketingConsent: z.boolean().default(false),
  consentTextVersion: z.string().optional(),
  source: z.string().optional(),
});

export type DownloadRequestInput = z.infer<typeof downloadRequestSchema>;

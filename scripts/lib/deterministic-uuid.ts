import { createHash } from "node:crypto";

/**
 * Fixture ids are human-readable slugs (e.g. "product-idea-snapshot"), not
 * valid Postgres uuids. This derives a stable, deterministic uuid-shaped
 * value from each slug (sha256 truncated into the 8-4-4-4-12 hex layout) so
 * re-running seed scripts produces byte-identical output, and so multiple
 * scripts can derive the same id for the same entity independently.
 */
export function deterministicUuid(seed: string): string {
  const hash = createHash("sha256").update(seed).digest("hex");
  return [hash.slice(0, 8), hash.slice(8, 12), hash.slice(12, 16), hash.slice(16, 20), hash.slice(20, 32)].join("-");
}

import { z } from "zod";

/**
 * A relaxed "looks like a UUID" check — 8-4-4-4-12 hex groups, no version/variant nibble
 * constraints enforced. `z.uuid()` enforces RFC4122 version bits (`[1-8]` at the version
 * position, `[89ab]` at the variant position), which
 * `scripts/lib/deterministic-uuid.ts`'s SHA256-derived ids (used for every framework/product
 * seeded via `scripts/seed.ts` — i.e. every framework/product in this database) don't reliably
 * satisfy: the algorithm is raw hex slicing with no attempt to force compliant nibbles, so each
 * id only has roughly a 1-in-8 chance of passing `z.uuid()` by pure coincidence. Real
 * Postgres-issued ids (`gen_random_uuid()` — e.g. `it_visual_assets.id`,
 * `it_product_content_revisions.id`) are already valid v4 UUIDs and pass either check, so this
 * relaxed schema is safe to use wherever a framework/product id is validated without weakening
 * anything meaningful — Zod's job here is shape validation, not uniqueness/existence, and a
 * malformed id simply won't match any row in the subsequent query regardless of which check
 * rejects it first.
 *
 * Found live: clicking "Generate candidates" against a real framework in the admin Visuals
 * workspace failed with "Invalid UUID" — every admin action validating a `productId`/
 * `frameworkId` with plain `z.uuid()` had the same latent bug, just never exercised with a real
 * authenticated browser session against real seeded content before.
 */
export const zId = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "Invalid ID.");

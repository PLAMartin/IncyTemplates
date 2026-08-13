# 0051 — Stripe checkout + fulfillment (first commerce/accounts slice)

## Status
Accepted

## Context

Commerce/accounts work started with the user's explicit choice of scope: Stripe checkout and fulfillment — the money pipeline, proven end-to-end, before customer accounts or a library exist — with immediate post-purchase file delivery included rather than deferred. No Stripe test keys exist yet, so this pass builds and unit-tests the full pipeline without live verification.

A research pass found the ground far more prepared than expected: `it_customers`, `it_orders`, `it_order_items`, `it_entitlements`, `it_webhook_events` were all created in the very first migrations (`20260728155509_profiles_and_customers.sql`, `20260728155515_commerce_tables.sql`), RLS already in place (read-only for customers/staff, all writes via service-role — same posture as the Visual Asset System). More significantly, **the entitlement-granting RPCs already existed and had never been called**: `it_grant_entitlement` and `it_expand_bundle_entitlements` (`20260728155522_functions_and_triggers.sql`), both `service_role`-only, both idempotent. This slice is a from-scratch app-code integration riding on an already-correct schema — no new entitlement-granting SQL was written.

## Decisions

**`idea-intake` chosen as the pilot product.** Simplest standalone (non-bundle) paid Template in the seed catalogue (£9.00 GBP, single markdown file). Flipped `status: "unlisted"` → `"published"` and `is_placeholder: true` → `false` in both the seed file and the live DB row, since it now has genuine content. `stripe_product_id`/`stripe_price_id` remain `null` — there is no way to create real Stripe objects without keys.

**A new `it-paid-files` storage bucket**, mirroring `it-free-files` exactly (private, no `storage.objects` policies — service-role only). A companion script, `scripts/seed-storage-paid.ts`, mirrors `scripts/seed-storage.ts`'s upload logic scoped to paid products with a `content/seed/paid-files/<slug>.md` file; only `idea-intake` has one so far, everything else is skipped (not an error) so the script can be re-run as more paid content is written.

**One-off Stripe product-sync script (`scripts/sync-stripe-product.ts`)** is written but not run — it's the actual unblock for a live test once the user has keys. Idempotent by skipping rather than updating: Stripe Prices are immutable, so a row with an existing `stripe_price_id` is left alone rather than risking a duplicate Price object.

**`stripe_price_id` added to the `Product` type as optional**, not to `ProductSummary`. Checkout is the only consumer and always reads a single `Product` via `getProductBySlug`, never a catalogue-listing summary — adding it to `ProductSummary` would have meant threading an internal Stripe id through every catalogue card for no reason. Optional (not required) so the ~94 existing seed-catalogue product literals didn't all need a new field.

**Checkout's product validation queries `it_products` directly via the service-role client**, not through `CatalogueSource`. `CatalogueSource.getProductById` was drafted and then deliberately reverted: the sibling free-download route (`resolveFreeTemplateFile` in `src/server/downloads/`) already establishes this pattern for exactly this class of route — sensitive, unauthenticated, money/entitlement-adjacent validation goes through a dedicated service-role query in `src/server/<feature>/`, not the public anon-backed read path. Nothing in this slice would actually have called `getProductById`; adding it would have been an unused abstraction.

**`it_grant_entitlement`/`it_expand_bundle_entitlements` are called with `p_profile_id: null`.** Every purchase this slice supports is guest checkout — there is no customer-facing sign-in yet (explicitly out of scope, per the user's choice of "checkout + fulfillment" over "customer auth + account shell"). Entitlements attach to the `it_customers` row (by email) but not yet to any `it_profiles` row; linking happens whenever customer accounts are built (spec §18.2's "link on first sign-in" flow is real remaining scope, not done here).

**Immediate post-purchase download uses a real Supabase Storage signed URL**, not the free flow's grant-cookie-plus-server-proxy pattern. That pattern was purpose-built for inline markdown viewing (streamed through the Next.js server, rendered as HTML); a paid download is a real file handoff, and spec §17.3 explicitly calls for "short-lived signed URLs" for this case. `resolvePaidOrderFile` never trusts a client-supplied `productId`/`fileId` — access is proven entirely by the Stripe Checkout Session id (unguessable, embedded in the success-page redirect URL by Stripe itself), matching how the `/checkout/success` page itself looks up the order.

**Idempotency is two-layered in the webhook.** `it_webhook_events.unique(provider, provider_event_id)` guards against Stripe redelivering the same event; a separate check-then-insert on `it_orders.stripe_checkout_session_id`, with a unique-violation catch as a second line of defense, guards against two near-simultaneous deliveries racing past the first check. Both are exercised in `tests/unit/fulfill-checkout-session.test.ts`.

**A new test-helper module, `tests/unit/helpers/fake-supabase.ts`**, was written for this slice — this repo had no prior precedent for mocking a chained Postgrest-style query builder in a unit test (all prior DB-touching logic was verified only via live Playwright runs). It queues canned `{data, error}` responses per table/RPC name, FIFO, matching the fixed call sequence each function under test actually makes, rather than attempting to replicate the full Postgrest chain API generically. Used across all four new test files.

## Follow-up

- **Live Stripe verification is deliberately deferred.** Once the user has test-mode keys: set `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`, run `npm run sync:stripe-product -- idea-intake`, then a real checkout with Stripe's `4242 4242 4242 4242` test card, verified via the existing `/admin/orders` page and a real webhook delivery (`stripe listen --forward-to localhost:3000/api/stripe/webhook` for local testing).
- **Only `checkout.session.completed` is processed.** `async_payment_succeeded`/`async_payment_failed`, `payment_intent.payment_failed`, `charge.refunded`, `charge.refund.updated`, and dispute events (all named in spec §19.3) are recorded into `it_webhook_events` for audit/idempotency but not acted on — real remaining scope, not silently dropped.
- **No confirmation email.** Resend is still unwired (no package installed, `RESEND_API_KEY` remains an unused `.optional()` placeholder) — the success page shows the order confirmation directly instead.
- **No customer-facing account or library.** Download access this pass is purely `session_id`-driven from the success page, not tied to a signed-in session — a repeat visitor has no way to re-download without their original checkout session id. Building customer auth + `/account/library` is what actually closes this gap, and remains a separate, explicit next slice.
- **Refunds are unhandled.** `it_orders.status` can represent `refunded`/`partially_refunded` and `it_entitlements.status` can represent `revoked`/`refunded`, but nothing in this slice transitions either — that's downstream of handling `charge.refunded`, above.

import { defineConfig, devices } from "@playwright/test";
import { STAFF_STORAGE_STATE_PATH } from "./tests/e2e/helpers/admin-auth";

const ADMIN_AUTHENTICATED_SPECS = ["**/admin-template-editor.spec.ts", "**/admin-tool-editor.spec.ts", "**/admin-collections.spec.ts"];

/**
 * Originally Phase 0/1 scope only (flows that don't need Stripe/Auth/a live
 * Supabase project — browse & filter, keyboard-only navigation, axe scans).
 * Phase 6 added real sign-in and /admin, so admin-auth.spec.ts now also
 * covers the unauthenticated redirect gate and the sign-in form itself.
 *
 * A fully authenticated admin CRUD flow needed a way to establish a real staff session in a
 * test browser context — now wired up via the "admin-setup"/"admin" projects below (spec v8
 * §10.11's e2e coverage gap, see docs/decisions/0061-admin-editorial-parity.md's "Not yet
 * done"): "admin-setup" signs in as staff once and saves a storageState file
 * (tests/e2e/admin-auth.setup.ts), "admin" runs the authenticated specs reusing it. Split into
 * a separate project (rather than just calling signInAsStaff() from each spec's own
 * beforeEach) specifically to avoid concurrent workers each requesting a fresh magic link for
 * the same staff email — doing that invalidates whichever link a concurrent worker hadn't
 * redeemed yet. Checkout/downloads remain deferred until those features exist.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:4000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      testIgnore: ADMIN_AUTHENTICATED_SPECS,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "admin-setup",
      testMatch: "**/admin-auth.setup.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "admin",
      testMatch: ADMIN_AUTHENTICATED_SPECS,
      dependencies: ["admin-setup"],
      use: { ...devices["Desktop Chrome"], storageState: STAFF_STORAGE_STATE_PATH },
    },
  ],
});

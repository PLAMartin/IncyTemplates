import { defineConfig, devices } from "@playwright/test";

/**
 * Originally Phase 0/1 scope only (flows that don't need Stripe/Auth/a live
 * Supabase project — browse & filter, keyboard-only navigation, axe scans).
 * Phase 6 added real sign-in and /admin, so admin-auth.spec.ts now also
 * covers the unauthenticated redirect gate and the sign-in form itself.
 * A fully authenticated admin CRUD flow still needs a way to establish a
 * real staff session in a test browser context (not wired up yet — see
 * that spec file's top comment) and checkout/downloads remain deferred
 * until those features exist.
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
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

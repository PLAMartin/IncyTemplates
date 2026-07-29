import { defineConfig, devices } from "@playwright/test";

/**
 * Phase 0/1 scope: only the flows that don't need Stripe/Auth/a live
 * Supabase project run here — browse & filter (spec §32.3 flow #1),
 * keyboard-only navigation (#12), and an axe accessibility scan of the
 * key pages. Everything else (checkout, sign-in, admin CRUD, downloads)
 * is deferred until those features exist.
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

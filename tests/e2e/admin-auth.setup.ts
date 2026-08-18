import { test as setup } from "@playwright/test";
import { getStaffAuthConfig, signInAsStaff, STAFF_STORAGE_STATE_PATH } from "./helpers/admin-auth";

/**
 * Playwright "setup project" (see playwright.config.ts's `admin-setup`/`admin` projects): signs
 * in as staff exactly once per test run and saves the session to disk, so the authenticated
 * admin specs (admin-template-editor.spec.ts, admin-tool-editor.spec.ts) share one storageState
 * instead of each calling `signInAsStaff` independently. That independent-call approach is what
 * this replaced — running those specs in parallel had each worker request its own fresh magic
 * link for the same staff email, and generating a new one invalidates any earlier not-yet-
 * redeemed link, so whichever worker lost the race silently landed back on /sign-in.
 *
 * Always writes a storageState file, even with no staff auth configured (an empty/anonymous
 * one) — the "admin" project's `storageState` points at this path unconditionally, and
 * Playwright errors outright if that file doesn't exist at all. Each admin spec's own
 * `test.beforeEach` still does the real `test.skip(!getStaffAuthConfig(), ...)` when creds are
 * absent (e.g. CI, which has no Supabase secrets), independent of what this setup step did.
 */
setup("establish a staff session for the admin specs", async ({ page, baseURL }) => {
  const config = getStaffAuthConfig();
  if (config) {
    await signInAsStaff(page, baseURL!);
  }
  await page.context().storageState({ path: STAFF_STORAGE_STATE_PATH });
});

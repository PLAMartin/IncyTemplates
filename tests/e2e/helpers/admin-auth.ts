import { createClient } from "@supabase/supabase-js";
import type { Page } from "@playwright/test";

/**
 * Mints a real staff session in a Playwright browser context so admin routes can be exercised
 * end-to-end. There is no fixtures path for `/admin` (unlike the public catalogue's
 * `CatalogueSource` abstraction) — every admin page/action talks to Supabase directly — so this
 * always needs a live project.
 *
 * Technique: `auth.admin.generateLink()` (service-role only) mints a magic-link URL with no
 * browser-side `code_challenge`, so Supabase can only respond with implicit-style fragment
 * tokens rather than a PKCE `?code=`. `src/app/auth/callback/implicit/page.tsx` is the
 * companion client page built specifically to redeem that shape (see its own doc comment) —
 * this is the first permanent Playwright spec to use it; prior sessions only ever ran this
 * as one-off Node scripts.
 *
 * Requires `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `E2E_STAFF_EMAIL` to
 * already be exported in the shell before `npm run e2e` (same convention as `scripts/*.ts` —
 * this repo's tsx/Playwright runs never auto-load `.env.local`). `E2E_STAFF_EMAIL` must be an
 * address with an existing `it_profiles` row and a staff role (owner/editor) on whichever
 * Supabase project `NEXT_PUBLIC_SUPABASE_URL` points at.
 */
export function getStaffAuthConfig(): { supabaseUrl: string; serviceRoleKey: string; staffEmail: string } | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const staffEmail = process.env.E2E_STAFF_EMAIL;
  if (!supabaseUrl || !serviceRoleKey || !staffEmail) return null;
  return { supabaseUrl, serviceRoleKey, staffEmail };
}

/** Human-readable reason for `test.skip()` when `getStaffAuthConfig()` returns null. */
export const STAFF_AUTH_SKIP_REASON =
  "Needs NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / E2E_STAFF_EMAIL exported in the shell (see tests/e2e/helpers/admin-auth.ts)";

/**
 * Shared by playwright.config.ts's "admin-setup"/"admin" projects and tests/e2e/admin-auth.setup.ts.
 * Not colocated in the setup file itself since playwright.config.ts (not a test file) needs the
 * same path and can't import from a `*.setup.ts` test file.
 */
export const STAFF_STORAGE_STATE_PATH = "tests/e2e/.auth/staff.json";

/**
 * Navigates `page` through a real staff sign-in. Throws if `getStaffAuthConfig()` would return
 * null — callers must check that (and `test.skip()`) first, this doesn't skip on its own.
 */
export async function signInAsStaff(page: Page, baseURL: string): Promise<void> {
  const config = getStaffAuthConfig();
  if (!config) {
    throw new Error("signInAsStaff() called without staff auth env configured — check getStaffAuthConfig() first.");
  }

  const admin = createClient(config.supabaseUrl, config.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: config.staffEmail,
    options: { redirectTo: `${baseURL}/auth/callback/implicit` },
  });

  if (error || !data.properties?.action_link) {
    throw new Error(`Failed to generate a staff sign-in link for ${config.staffEmail}: ${error?.message ?? "no action_link returned"}`);
  }

  await page.goto(data.properties.action_link);
  await page.waitForURL((url) => !url.pathname.startsWith("/auth/callback"), { timeout: 15000 });
}

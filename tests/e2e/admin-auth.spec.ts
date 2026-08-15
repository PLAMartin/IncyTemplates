import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Covers what's testable without a live-email magic-link round trip: the
 * unauthenticated redirect gate (src/proxy.ts) and the sign-in form's own
 * behaviour. A fully authenticated admin CRUD flow (viewing/editing
 * Frameworks, Guides, etc.) needs a way to establish a real staff session
 * in a test browser context — e.g. Supabase's `auth.admin.generateLink` to
 * mint a usable magic-link URL, or seeding a session cookie directly — which
 * isn't wired up yet. That's real remaining scope, not covered here; see
 * the Phase 6 build notes.
 */

test("visiting /admin while signed out redirects to /sign-in with a redirectTo param", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/sign-in\?redirectTo=%2Fadmin/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

test("visiting a nested admin route while signed out redirects to /sign-in", async ({ page }) => {
  await page.goto("/admin/frameworks");
  await expect(page).toHaveURL(/\/sign-in\?redirectTo=%2Fadmin%2Fframeworks/);
});

// Same infra gap as above applies to the source-post mapping workspace: the
// accept/adjust/dismiss review flow (spec v7 acceptance items 10-12) needs a real staff
// session in a test browser context, which isn't wired up yet. This covers what's testable
// without one — the redirect gate — for both new routes.
test("visiting /admin/source-posts while signed out redirects to /sign-in", async ({ page }) => {
  await page.goto("/admin/source-posts");
  await expect(page).toHaveURL(/\/sign-in\?redirectTo=%2Fadmin%2Fsource-posts/);
});

test("visiting an /admin/source-posts/review/[id] route while signed out redirects to /sign-in", async ({ page }) => {
  await page.goto("/admin/source-posts/review/12345.example-post");
  await expect(page).toHaveURL(/\/sign-in\?redirectTo=/);
});

test("sign-in form accepts an email and shows a status message on submit", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Email address").fill("staff-e2e-test@example.com");
  await page.getByRole("button", { name: "Send sign-in link" }).click();

  // Either a real Supabase project sent the link ("Check ... for a sign-in link") or this
  // environment has no Supabase configured ("isn't connected yet") — either is a legitimate
  // outcome depending on how the test run is configured; a silent failure/crash is not. Text
  // match rather than role, since the form always renders a (normally empty) sr-only
  // role="status" live region regardless of outcome — asserting on that role alone wouldn't
  // actually distinguish "it worked" from "nothing happened".
  await expect(page.getByText(/check .* for a sign-in link|isn.t connected yet|something went wrong/i)).toBeVisible();
});

test("sign-in page has no serious/critical axe violations", async ({ page }) => {
  await page.goto("/sign-in");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
});

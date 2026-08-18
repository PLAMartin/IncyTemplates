import { test, expect } from "@playwright/test";
import { getStaffAuthConfig, STAFF_AUTH_SKIP_REASON } from "./helpers/admin-auth";

/**
 * Covers the gap flagged in docs/decisions/0061-admin-editorial-parity.md's "Not yet done":
 * e2e coverage for the Tool editor's common-copy + tool-specific-copy bundling (spec v8
 * §10.11.5). Target is the "mvp-scoper" Tool (Scope Decider) — the original copySchema
 * reference implementation, and the only one of the 26 that had a schema before spec v8.
 *
 * Deliberately draft-only, same reasoning as admin-template-editor.spec.ts: only "Save draft"
 * is ever clicked, never "Publish" — this bundling writes two draft revisions (common copy on
 * `it_product_content_revisions`, tool-specific copy on `it_tool_copy_revisions`), neither of
 * which is visible to a real visitor until explicitly published.
 */

const TOOL_KEY = "mvp-scoper";
const TOOL_NAME = "Scope Decider";

// The "admin" Playwright project (playwright.config.ts) already applies a signed-in
// storageState via its "admin-setup" dependency; this just gives a clear skip reason when no
// staff auth is configured (e.g. CI), rather than failing against an anonymous session.
test.beforeEach(() => {
  test.skip(!getStaffAuthConfig(), STAFF_AUTH_SKIP_REASON);
});

test("Tool editor bundles common copy and tool-specific copy in one Editorial content section", async ({ page }) => {
  await page.goto("/admin/tools");
  await page.getByRole("link", { name: TOOL_NAME }).click();
  await expect(page).toHaveURL(`/admin/tools/${TOOL_KEY}`);
  await expect(page.getByRole("heading", { name: TOOL_KEY, exact: true })).toBeVisible();

  const editorial = page.locator("section", { has: page.getByRole("heading", { name: "Editorial content" }) });
  await expect(editorial.getByLabel("Name")).toBeVisible();
  await expect(editorial.getByLabel("Short description")).toBeVisible();
  await expect(editorial.getByLabel("Intro heading")).toBeVisible();
  await expect(editorial.getByLabel("Start button label")).toBeVisible();

  // One Save draft/Publish action covers both halves — not two separate forms.
  await expect(editorial.getByRole("button", { name: "Save draft" })).toHaveCount(1);
  await expect(editorial.getByRole("button", { name: "Publish" })).toHaveCount(1);

  await expect(page.getByRole("heading", { name: "Tool copy history" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Common copy history" })).toBeVisible();
});

test("staff can save a Tool editorial draft and it persists across reload without publishing", async ({ page }) => {
  const marker = `E2E marker ${Date.now()}`;

  await page.goto(`/admin/tools/${TOOL_KEY}`);

  await page.getByLabel("Intro heading").fill(marker);
  await page.getByLabel("Change note (optional)").fill(marker);

  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Draft saved." })).toBeVisible();
  await expect(page.getByText("Unpublished changes")).toBeVisible();

  // The live Tool page must be unaffected by an unpublished draft.
  await page.goto("/tools/mvp-scoper");
  await expect(page.getByText(marker)).toHaveCount(0);

  await page.goto(`/admin/tools/${TOOL_KEY}`);
  await expect(page.getByText("Unpublished changes")).toBeVisible();
  await expect(page.getByLabel("Intro heading")).toHaveValue(marker);
});

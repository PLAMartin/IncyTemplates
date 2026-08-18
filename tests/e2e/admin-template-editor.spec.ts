import { test, expect } from "@playwright/test";
import { getStaffAuthConfig, STAFF_AUTH_SKIP_REASON } from "./helpers/admin-auth";

/**
 * Covers the gap flagged in docs/decisions/0061-admin-editorial-parity.md's "Not yet done":
 * e2e coverage for the new Template "Editorial content" section (spec v8 §10.11.4).
 *
 * Deliberately draft-only: every assertion here calls "Save draft", never "Publish" — the new
 * editorial content lives in `it_product_content_revisions` as an unpublished revision until
 * explicitly published, so this never changes what a real visitor sees on the live site. Target
 * is the "MVP Scope in One Page" Template (mvp-scoper family) — chosen because its Tool
 * (mvp-scoper) was the original copySchema reference implementation, the most battle-tested of
 * the 26.
 */

const TEMPLATE_NAME = "MVP Scope in One Page";

// The "admin" Playwright project (playwright.config.ts) already applies a signed-in
// storageState via its "admin-setup" dependency; this just gives a clear skip reason when no
// staff auth is configured (e.g. CI), rather than failing against an anonymous session.
test.beforeEach(() => {
  test.skip(!getStaffAuthConfig(), STAFF_AUTH_SKIP_REASON);
});

test("Template editor has a separate Editorial content section alongside file versioning", async ({ page }) => {
  await page.goto("/admin/templates");
  await page.getByRole("link", { name: TEMPLATE_NAME }).click();
  await expect(page).toHaveURL(/\/admin\/templates\/[^/]+$/);

  const editorialHeading = page.getByRole("heading", { name: "Editorial content", exact: true });
  const versionHeading = page.getByRole("heading", { name: "Create a new version" });
  await expect(editorialHeading).toBeVisible();
  await expect(versionHeading).toBeVisible();

  // Editorial content strictly precedes the file-version section in document order (spec
  // v8 §10.11.4 — copy-only publishing must not require a file upload, and vice versa).
  const editorialBox = await editorialHeading.boundingBox();
  const versionBox = await versionHeading.boundingBox();
  expect(editorialBox!.y).toBeLessThan(versionBox!.y);

  // Scoped to the Editorial content section: TemplateUploadForm below it has its own "Display
  // name" field, whose accessible name substring-matches an unscoped getByLabel("Name").
  const editorial = page.locator("section", { has: editorialHeading });
  await expect(editorial.getByLabel("Name", { exact: true })).toBeVisible();
  await expect(editorial.getByLabel("Short description")).toBeVisible();
  await expect(editorial.getByLabel("Instructions (Markdown)")).toBeVisible();
});

test("staff can save an Editorial content draft and it persists across reload without publishing", async ({ page }) => {
  const marker = `E2E marker ${Date.now()}`;

  await page.goto("/admin/templates");
  await page.getByRole("link", { name: TEMPLATE_NAME }).click();

  const instructions = page.getByLabel("Instructions (Markdown)");
  const existingInstructions = await instructions.inputValue();
  await instructions.fill(`${marker}\n\n${existingInstructions}`);
  await page.getByLabel("Change note (optional)").fill(marker);

  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Draft saved." })).toBeVisible();

  // A draft never touches the published columns, so the public product page must be untouched.
  await expect(page.getByText("unpublished editorial changes")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Create a new version" })).toBeVisible();

  await page.reload();
  await expect(page.getByText("unpublished editorial changes")).toBeVisible();
  await expect(page.getByLabel("Instructions (Markdown)")).toHaveValue(new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

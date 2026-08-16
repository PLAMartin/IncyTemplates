import { test, expect } from "@playwright/test";

// Mirrors tests/e2e/story-builder-tool.spec.ts's coverage, generalised to the twenty-fourth
// Tool's 3-step, all-optional flow — a completeness checker, not a scorer (docs/decisions/0055).

test("anonymous visitor can check a partial negotiation prep and see what's missing", async ({ page }) => {
  await page.goto("/tools/negotiation-prep");
  await expect(page.getByRole("heading", { name: "Negotiation Readiness Check", exact: false }).first()).toBeVisible();

  await page.getByRole("button", { name: "Start checking your prep" }).click();

  await expect(page.getByText("Question 1 of 3")).toBeVisible();
  await page.getByLabel(/Fallback — what will you do/).fill("Keep the current supplier for another year.");
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 2: leave blank, just continue.
  await expect(page.getByText("Question 2 of 3")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 3: leave blank too, then check.
  await expect(page.getByText("Question 3 of 3")).toBeVisible();
  await page.getByRole("button", { name: "Check my prep" }).click();

  await expect(page.getByRole("heading", { name: "2 tactics still to prepare" })).toBeVisible();
  await expect(page.getByText("Keep the current supplier for another year.").first()).toBeVisible();
  await expect(page.getByText("Not prepared yet.").first()).toBeVisible();
  // BATNA was filled, so the tip should point at the next missing tactic, Anchor.
  await expect(page.getByText(/first number/)).toBeVisible();

  // Copy result works without throwing (clipboard permission may be denied in CI — the
  // component swallows that failure per its try/catch, so this only asserts no crash).
  await page.getByRole("button", { name: "Copy result" }).click();
});

test("leaving every tactic blank shows an actionable error instead of completing", async ({ page }) => {
  await page.goto("/tools/negotiation-prep");
  await page.getByRole("button", { name: "Start checking your prep" }).click();

  for (let i = 0; i < 2; i++) {
    await page.getByRole("button", { name: "Continue" }).click();
  }
  await page.getByRole("button", { name: "Check my prep" }).click();

  await expect(page.locator('p[role="alert"]')).toContainText("Enter at least one element above");
  await expect(page.getByRole("heading", { name: /tactics still to prepare|ready to negotiate/ })).not.toBeVisible();
});

test("keyboard-only visitor can check their negotiation prep", async ({ page }) => {
  await page.goto("/tools/negotiation-prep");

  await page.getByRole("button", { name: "Start checking your prep" }).focus();
  await page.keyboard.press("Enter");

  await expect(page.getByText("Question 1 of 3")).toBeVisible();
  await page.locator("textarea").focus();
  await page.keyboard.type("Walk away and keep the incumbent.");
  await page.getByRole("button", { name: "Continue" }).focus();
  await page.keyboard.press("Enter");

  await expect(page.getByText("Question 2 of 3")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).focus();
  await page.keyboard.press("Enter");

  await expect(page.getByText("Question 3 of 3")).toBeVisible();
  await page.getByRole("button", { name: "Check my prep" }).focus();
  await page.keyboard.press("Enter");

  const resultHeading = page.getByRole("heading", { name: /tactics still to prepare/ });
  await expect(resultHeading).toBeVisible();
  // Spec §10.6/§32.4: focus moves to the result on completion.
  await expect(resultHeading).toBeFocused();
});

test.describe("mobile viewport", () => {
  // Deliberately just a viewport override, not a full `devices["iPhone 13"]` spread — the
  // full device preset sets `defaultBrowserType: "webkit"`, which this project (chromium
  // only, per playwright.config.ts) can't honour inside a describe-level `test.use`.
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("Negotiation Readiness Check is completable on a mobile viewport", async ({ page }) => {
    await page.goto("/tools/negotiation-prep");
    await page.getByRole("button", { name: "Start checking your prep" }).click();

    await page.getByLabel(/Fallback — what will you do/).fill("Walk away and keep the incumbent.");
    for (let i = 0; i < 2; i++) {
      await page.getByRole("button", { name: "Continue" }).click();
    }
    await page.getByRole("button", { name: "Check my prep" }).click();

    await expect(page.getByRole("heading", { name: /tactics still to prepare/ })).toBeVisible();
  });
});

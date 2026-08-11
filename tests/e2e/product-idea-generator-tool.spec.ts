import { test, expect } from "@playwright/test";

// Mirrors tests/e2e/pricing-your-product-tool.spec.ts's coverage, generalised to the ninth
// Tool's mixed step shape: three optional free-text steps (one per idea-sourcing method) plus
// one required select step (docs/decisions/0029).

test("anonymous visitor can complete the Idea Direction Generator with a single free-text answer", async ({ page }) => {
  await page.goto("/tools/product-idea-generator");
  await expect(page.getByRole("heading", { name: "Idea Direction Generator", exact: false }).first()).toBeVisible();

  await page.getByRole("button", { name: "Start generating ideas" }).click();

  // Step 1 (scratch your own itch): fill it in.
  await expect(page.getByText("Question 1 of 4")).toBeVisible();
  await page.getByLabel(/quietly annoys you/).fill("chasing unpaid invoices every month");
  await page.getByRole("button", { name: "Continue" }).click();

  // Steps 2 and 3: leave blank, just continue.
  await expect(page.getByText("Question 2 of 4")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Question 3 of 4")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 4 (select): pick an option and finish.
  await expect(page.getByText("Question 4 of 4")).toBeVisible();
  await page.locator('fieldset input[type="radio"]').first().check();
  await page.getByRole("button", { name: "See my result" }).click();

  await expect(page.getByRole("heading", { name: "Your idea direction" })).toBeVisible();
  await expect(page.getByText("Scratch your own itch", { exact: true })).toBeVisible();
  await expect(page.getByText(/chasing unpaid invoices every month/)).toBeVisible();

  // Copy result works without throwing (clipboard permission may be denied in CI — the
  // component swallows that failure per its try/catch, so this only asserts no crash).
  await page.getByRole("button", { name: "Copy result" }).click();
});

test("leaving every free-text answer blank shows an actionable error instead of completing", async ({ page }) => {
  await page.goto("/tools/product-idea-generator");
  await page.getByRole("button", { name: "Start generating ideas" }).click();

  // Skip all three text steps without answering.
  for (let step = 0; step < 3; step++) {
    await page.getByRole("button", { name: "Continue" }).click();
  }

  // Select step: answer it, then try to finish with nothing entered above.
  await page.locator('fieldset input[type="radio"]').first().check();
  await page.getByRole("button", { name: "See my result" }).click();

  await expect(page.locator('p[role="alert"]')).toContainText("Enter at least one answer above");
  // Still on the question phase, not the result.
  await expect(page.getByRole("heading", { name: "Your idea direction" })).not.toBeVisible();

  // Go back and fill one field in, then retry successfully.
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: "Back" }).click();
  }
  await page.getByLabel(/quietly annoys you/).fill("something real");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.locator('fieldset input[type="radio"]').first().check();
  await page.getByRole("button", { name: "See my result" }).click();
  await expect(page.getByRole("heading", { name: "Your idea direction" })).toBeVisible();
});

test("keyboard-only visitor can complete the Idea Direction Generator", async ({ page }) => {
  await page.goto("/tools/product-idea-generator");

  await page.getByRole("button", { name: "Start generating ideas" }).focus();
  await page.keyboard.press("Enter");

  await expect(page.getByText("Question 1 of 4")).toBeVisible();
  await page.getByLabel(/quietly annoys you/).focus();
  await page.keyboard.type("something worth testing");
  await page.getByRole("button", { name: "Continue" }).focus();
  await page.keyboard.press("Enter");

  for (let step = 1; step < 3; step++) {
    await expect(page.getByText(`Question ${step + 1} of 4`)).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).focus();
    await page.keyboard.press("Enter");
  }

  await expect(page.getByText("Question 4 of 4")).toBeVisible();
  const firstRadio = page.locator('fieldset input[type="radio"]').first();
  await firstRadio.focus();
  await page.keyboard.press(" ");
  await expect(firstRadio).toBeChecked();
  await page.getByRole("button", { name: "See my result" }).focus();
  await page.keyboard.press("Enter");

  const resultHeading = page.getByRole("heading", { name: "Your idea direction" });
  await expect(resultHeading).toBeVisible();
  // Spec §10.6/§32.4: focus moves to the result on completion.
  await expect(resultHeading).toBeFocused();
});

test.describe("mobile viewport", () => {
  // Deliberately just a viewport override, not a full `devices["iPhone 13"]` spread — the
  // full device preset sets `defaultBrowserType: "webkit"`, which this project (chromium
  // only, per playwright.config.ts) can't honour inside a describe-level `test.use`.
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("Idea Direction Generator is completable on a mobile viewport", async ({ page }) => {
    await page.goto("/tools/product-idea-generator");
    await page.getByRole("button", { name: "Start generating ideas" }).click();

    // Step 1: fill it in. Steps 2 and 3: leave blank, just continue.
    await page.getByLabel(/quietly annoys you/).fill("something worth testing");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 4 (select): pick an option and finish.
    await page.locator('fieldset input[type="radio"]').first().check();
    await page.getByRole("button", { name: "See my result" }).click();

    await expect(page.getByRole("heading", { name: "Your idea direction" })).toBeVisible();
  });
});

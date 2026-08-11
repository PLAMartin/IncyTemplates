import { test, expect } from "@playwright/test";

// Mirrors tests/e2e/writing-editor-tool.spec.ts's coverage, generalised to the twenty-first
// Tool's 10-step flow. The third use of the completeness-checklist mechanic, back to Story
// Builder's original polarity: a checklist of present/missing principles, not a single verdict
// or ranked list (docs/decisions/0041).

const STEP_COUNT = 10;

/** Selects the option at `index` (default first — "Not yet") in the currently-visible step via pointer. */
async function answerCurrentStep(page: import("@playwright/test").Page, index = 0) {
  const radios = page.locator('fieldset input[type="radio"]');
  await radios.nth(index).check();
}

test("anonymous visitor can complete the Design Self-Assessment and see a result", async ({ page }) => {
  await page.goto("/tools/app-design-review");
  await expect(page.getByRole("heading", { name: "Design Self-Assessment", exact: false }).first()).toBeVisible();

  await page.getByRole("button", { name: "Start the self-assessment" }).click();

  for (let step = 0; step < STEP_COUNT; step++) {
    await expect(page.getByText(`Question ${step + 1} of ${STEP_COUNT}`)).toBeVisible();
    // First option every step: "Not yet" — flags every principle as missing.
    await answerCurrentStep(page, 0);
    const isLast = step === STEP_COUNT - 1;
    await page.getByRole("button", { name: isLast ? "See my review" : "Continue" }).click();
  }

  await expect(page.getByRole("heading", { name: "10 principles still missing" })).toBeVisible();

  // Copy result works without throwing (clipboard permission may be denied in CI — the
  // component swallows that failure per its try/catch, so this only asserts no crash).
  await page.getByRole("button", { name: "Copy result" }).click();
});

test("a product that already has every principle shows no gaps", async ({ page }) => {
  await page.goto("/tools/app-design-review");
  await page.getByRole("button", { name: "Start the self-assessment" }).click();

  for (let step = 0; step < STEP_COUNT; step++) {
    // Second option every step: "Already there."
    await answerCurrentStep(page, 1);
    const isLast = step === STEP_COUNT - 1;
    await page.getByRole("button", { name: isLast ? "See my review" : "Continue" }).click();
  }

  await expect(page.getByRole("heading", { name: "All ten principles are there" })).toBeVisible();
});

test("keyboard-only visitor can complete the Design Self-Assessment", async ({ page }) => {
  await page.goto("/tools/app-design-review");

  await page.getByRole("button", { name: "Start the self-assessment" }).focus();
  await page.keyboard.press("Enter");

  for (let step = 0; step < STEP_COUNT; step++) {
    await expect(page.getByText(`Question ${step + 1} of ${STEP_COUNT}`)).toBeVisible();

    const firstRadio = page.locator('fieldset input[type="radio"]').first();
    await firstRadio.focus();
    await page.keyboard.press(" ");
    await expect(firstRadio).toBeChecked();

    const isLast = step === STEP_COUNT - 1;
    const continueButton = page.getByRole("button", { name: isLast ? "See my review" : "Continue" });
    await continueButton.focus();
    await page.keyboard.press("Enter");
  }

  const resultHeading = page.getByRole("heading", { name: /principle/ });
  await expect(resultHeading).toBeVisible();
  // Spec §10.6/§32.4: focus moves to the result on completion.
  await expect(resultHeading).toBeFocused();
});

test.describe("mobile viewport", () => {
  // Deliberately just a viewport override, not a full `devices["iPhone 13"]` spread — the
  // full device preset sets `defaultBrowserType: "webkit"`, which this project (chromium
  // only, per playwright.config.ts) can't honour inside a describe-level `test.use`.
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("Design Self-Assessment is completable on a mobile viewport", async ({ page }) => {
    await page.goto("/tools/app-design-review");
    await page.getByRole("button", { name: "Start the self-assessment" }).click();

    for (let step = 0; step < STEP_COUNT; step++) {
      await answerCurrentStep(page);
      const isLast = step === STEP_COUNT - 1;
      await page.getByRole("button", { name: isLast ? "See my review" : "Continue" }).click();
    }

    await expect(page.getByRole("heading", { name: /principle/ })).toBeVisible();
  });
});

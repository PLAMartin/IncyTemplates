import { test, expect } from "@playwright/test";

// Mirrors tests/e2e/app-design-review-tool.spec.ts's coverage, generalised to the twenty-fifth
// Tool's 10-step flow — the fifth use of the completeness-checklist mechanic, same polarity as
// App Design Review (docs/decisions/0057).

const STEP_COUNT = 10;

/** Selects the option at `index` (default first — "Not yet") in the currently-visible step via pointer. */
async function answerCurrentStep(page: import("@playwright/test").Page, index = 0) {
  const radios = page.locator('fieldset input[type="radio"]');
  await radios.nth(index).check();
}

test("anonymous visitor can complete the Pitch Stickiness Check and see a result", async ({ page }) => {
  await page.goto("/tools/sticky-pitch-checker");
  await expect(page.getByRole("heading", { name: "Pitch Stickiness Check", exact: false }).first()).toBeVisible();

  await page.getByRole("button", { name: "Start the check" }).click();

  for (let step = 0; step < STEP_COUNT; step++) {
    await expect(page.getByText(`Question ${step + 1} of ${STEP_COUNT}`)).toBeVisible();
    // First option every step: "Not yet" — flags every factor as missing.
    await answerCurrentStep(page, 0);
    const isLast = step === STEP_COUNT - 1;
    await page.getByRole("button", { name: isLast ? "See my result" : "Continue" }).click();
  }

  await expect(page.getByRole("heading", { name: "10 factors still missing" })).toBeVisible();
  await expect(page.getByText("0/6")).toBeVisible();
  await expect(page.getByText("0/4")).toBeVisible();

  // Copy result works without throwing (clipboard permission may be denied in CI — the
  // component swallows that failure per its try/catch, so this only asserts no crash).
  await page.getByRole("button", { name: "Copy result" }).click();
});

test("a pitch that already has every factor shows no gaps", async ({ page }) => {
  await page.goto("/tools/sticky-pitch-checker");
  await page.getByRole("button", { name: "Start the check" }).click();

  for (let step = 0; step < STEP_COUNT; step++) {
    // Second option every step: "Already there."
    await answerCurrentStep(page, 1);
    const isLast = step === STEP_COUNT - 1;
    await page.getByRole("button", { name: isLast ? "See my result" : "Continue" }).click();
  }

  await expect(page.getByRole("heading", { name: "All ten factors are there" })).toBeVisible();
  await expect(page.getByText("6/6")).toBeVisible();
  await expect(page.getByText("4/4")).toBeVisible();
});

test("keyboard-only visitor can complete the Pitch Stickiness Check", async ({ page }) => {
  await page.goto("/tools/sticky-pitch-checker");

  await page.getByRole("button", { name: "Start the check" }).focus();
  await page.keyboard.press("Enter");

  for (let step = 0; step < STEP_COUNT; step++) {
    await expect(page.getByText(`Question ${step + 1} of ${STEP_COUNT}`)).toBeVisible();

    const firstRadio = page.locator('fieldset input[type="radio"]').first();
    await firstRadio.focus();
    await page.keyboard.press(" ");
    await expect(firstRadio).toBeChecked();

    const isLast = step === STEP_COUNT - 1;
    const continueButton = page.getByRole("button", { name: isLast ? "See my result" : "Continue" });
    await continueButton.focus();
    await page.keyboard.press("Enter");
  }

  const resultHeading = page.getByRole("heading", { name: /factor/ });
  await expect(resultHeading).toBeVisible();
  // Spec §10.6/§32.4: focus moves to the result on completion.
  await expect(resultHeading).toBeFocused();
});

test.describe("mobile viewport", () => {
  // Deliberately just a viewport override, not a full `devices["iPhone 13"]` spread — the
  // full device preset sets `defaultBrowserType: "webkit"`, which this project (chromium
  // only, per playwright.config.ts) can't honour inside a describe-level `test.use`.
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("Pitch Stickiness Check is completable on a mobile viewport", async ({ page }) => {
    await page.goto("/tools/sticky-pitch-checker");
    await page.getByRole("button", { name: "Start the check" }).click();

    for (let step = 0; step < STEP_COUNT; step++) {
      await answerCurrentStep(page);
      const isLast = step === STEP_COUNT - 1;
      await page.getByRole("button", { name: isLast ? "See my result" : "Continue" }).click();
    }

    await expect(page.getByRole("heading", { name: /factor/ })).toBeVisible();
  });
});

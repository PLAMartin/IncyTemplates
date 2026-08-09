import { test, expect } from "@playwright/test";

// Spec §32.3-style coverage for the Next Step Finder (spec §22): anonymous completion,
// keyboard-only completion, and a mobile-viewport run — the same pattern every Tool's e2e
// spec follows, adapted to the Finder's 3-step flow.

const STEP_COUNT = 3;

/** Selects the first option in the currently-visible step via mouse/pointer interaction. */
async function answerCurrentStepWithFirstOption(page: import("@playwright/test").Page) {
  const radios = page.locator('fieldset input[type="radio"]');
  await radios.first().check();
}

test("anonymous visitor can complete the Next Step Finder and see a recommendation", async ({ page }) => {
  await page.goto("/finder");
  await expect(page.getByRole("heading", { name: "Next Step Finder", level: 1 })).toBeVisible();

  await page.getByRole("button", { name: "Find my next step" }).click();

  for (let step = 0; step < STEP_COUNT; step++) {
    await expect(page.getByText(`Question ${step + 1} of ${STEP_COUNT}`)).toBeVisible();
    await answerCurrentStepWithFirstOption(page);
    const isLast = step === STEP_COUNT - 1;
    await page.getByRole("button", { name: isLast ? "See my recommendation" : "Continue" }).click();
  }

  // First option in every step: assess an idea (-> Product Idea Assessor), nothing done
  // yet, "learn the method first" (-> Guide, an explicit override). Free, since every
  // output in this catalogue is free.
  await expect(page.getByRole("heading", { name: "Your recommendation" })).toBeVisible();
  await expect(page.getByText("Free to start")).toBeVisible();
  await expect(page.getByRole("link", { name: /Product Idea Assessor: the Guide/ })).toBeVisible();
  // Product Idea Assessor's own next-step family should appear as a supporting recommendation.
  await expect(page.getByRole("heading", { name: "Next steps after that" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Customer Discovery Kit/ })).toBeVisible();
});

test("keyboard-only visitor can complete the Next Step Finder", async ({ page }) => {
  await page.goto("/finder");

  await page.getByRole("button", { name: "Find my next step" }).focus();
  await page.keyboard.press("Enter");

  for (let step = 0; step < STEP_COUNT; step++) {
    await expect(page.getByText(`Question ${step + 1} of ${STEP_COUNT}`)).toBeVisible();

    const firstRadio = page.locator('fieldset input[type="radio"]').first();
    await firstRadio.focus();
    await page.keyboard.press(" ");
    await expect(firstRadio).toBeChecked();

    const isLast = step === STEP_COUNT - 1;
    const continueButton = page.getByRole("button", { name: isLast ? "See my recommendation" : "Continue" });
    await continueButton.focus();
    await page.keyboard.press("Enter");
  }

  const resultHeading = page.getByRole("heading", { name: "Your recommendation" });
  await expect(resultHeading).toBeVisible();
  // Spec §10.6/§32.4: focus moves to the result on completion.
  await expect(resultHeading).toBeFocused();
});

test.describe("mobile viewport", () => {
  // Deliberately just a viewport override, not a full `devices["iPhone 13"]` spread — the
  // full device preset sets `defaultBrowserType: "webkit"`, which this project (chromium
  // only, per playwright.config.ts) can't honour inside a describe-level `test.use`.
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("Next Step Finder is completable on a mobile viewport", async ({ page }) => {
    await page.goto("/finder");
    await page.getByRole("button", { name: "Find my next step" }).click();

    for (let step = 0; step < STEP_COUNT; step++) {
      await answerCurrentStepWithFirstOption(page);
      const isLast = step === STEP_COUNT - 1;
      await page.getByRole("button", { name: isLast ? "See my recommendation" : "Continue" }).click();
    }

    await expect(page.getByRole("heading", { name: "Your recommendation" })).toBeVisible();
  });
});

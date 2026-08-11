import { test, expect } from "@playwright/test";

// Mirrors tests/e2e/business-model-chooser-tool.spec.ts's coverage, generalised to the
// sixteenth Tool's 4-step flow. Unlike every prior scoring Tool, this one reports the
// *weakest* stage, not the strongest, and has no gate (docs/decisions/0036).

const STEP_COUNT = 4;

/** Selects the option at `index` (default first) in the currently-visible step via pointer. */
async function answerCurrentStep(page: import("@playwright/test").Page, index = 0) {
  const radios = page.locator('fieldset input[type="radio"]');
  await radios.nth(index).check();
}

test("anonymous visitor can complete the Engagement Loop Mapper and see a diagnosis", async ({ page }) => {
  await page.goto("/tools/user-engagement-designer");
  await expect(page.getByRole("heading", { name: "Engagement Loop Mapper", exact: false }).first()).toBeVisible();

  await page.getByRole("button", { name: "Start mapping your loop" }).click();

  for (let step = 0; step < STEP_COUNT; step++) {
    await expect(page.getByText(`Question ${step + 1} of ${STEP_COUNT}`)).toBeVisible();
    await answerCurrentStep(page);
    const isLast = step === STEP_COUNT - 1;
    await page.getByRole("button", { name: isLast ? "See my result" : "Continue" }).click();
  }

  // First option every step: all four stages score "strong" (3/3/3/3) — a full tie, resolved
  // by fixed STAGE_ORDER toward Trigger, with Action as the second-weakest.
  await expect(page.getByRole("heading", { name: /^Your weakest link: Trigger/ })).toBeVisible();
  await expect(page.getByText("Also worth strengthening", { exact: true })).toBeVisible();
  await expect(page.getByText("Action", { exact: true })).toBeVisible();

  // Copy result works without throwing (clipboard permission may be denied in CI — the
  // component swallows that failure per its try/catch, so this only asserts no crash).
  await page.getByRole("button", { name: "Copy result" }).click();
});

test("keyboard-only visitor can complete the Engagement Loop Mapper", async ({ page }) => {
  await page.goto("/tools/user-engagement-designer");

  await page.getByRole("button", { name: "Start mapping your loop" }).focus();
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

  const resultHeading = page.getByRole("heading", { name: /^Your weakest link:/ });
  await expect(resultHeading).toBeVisible();
  // Spec §10.6/§32.4: focus moves to the result on completion.
  await expect(resultHeading).toBeFocused();
});

test.describe("mobile viewport", () => {
  // Deliberately just a viewport override, not a full `devices["iPhone 13"]` spread — the
  // full device preset sets `defaultBrowserType: "webkit"`, which this project (chromium
  // only, per playwright.config.ts) can't honour inside a describe-level `test.use`.
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("Engagement Loop Mapper is completable on a mobile viewport", async ({ page }) => {
    await page.goto("/tools/user-engagement-designer");
    await page.getByRole("button", { name: "Start mapping your loop" }).click();

    for (let step = 0; step < STEP_COUNT; step++) {
      await answerCurrentStep(page);
      const isLast = step === STEP_COUNT - 1;
      await page.getByRole("button", { name: isLast ? "See my result" : "Continue" }).click();
    }

    await expect(page.getByRole("heading", { name: /^Your weakest link:/ })).toBeVisible();
  });
});

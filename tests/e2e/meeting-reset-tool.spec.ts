import { test, expect } from "@playwright/test";

// Mirrors tests/e2e/business-model-chooser-tool.spec.ts's coverage, generalised to the
// twentieth Tool's 4-step flow. Unlike every scoring-matrix Tool, this one returns a single
// gated verdict, not a ranked list (docs/decisions/0039).

const STEP_COUNT = 4;

/** Selects the option at `index` (default first) in the currently-visible step via pointer. */
async function answerCurrentStep(page: import("@playwright/test").Page, index = 0) {
  const radios = page.locator('fieldset input[type="radio"]');
  await radios.nth(index).check();
}

test("anonymous visitor can complete the Meeting Usefulness Diagnostic and see a verdict", async ({ page }) => {
  await page.goto("/tools/meeting-reset");
  await expect(page.getByRole("heading", { name: "Meeting Usefulness Diagnostic", exact: false }).first()).toBeVisible();

  await page.getByRole("button", { name: "Start the diagnostic" }).click();

  for (let step = 0; step < STEP_COUNT; step++) {
    await expect(page.getByText(`Question ${step + 1} of ${STEP_COUNT}`)).toBeVisible();
    await answerCurrentStep(page);
    const isLast = step === STEP_COUNT - 1;
    await page.getByRole("button", { name: isLast ? "See my verdict" : "Continue" }).click();
  }

  // First option every step: clear purpose, spaghetti interaction, decision needed, everyone
  // essential — falls through every gate to "keep as meeting."
  await expect(page.getByRole("heading", { name: "Verdict: Keep it as a meeting" })).toBeVisible();

  // Copy result works without throwing (clipboard permission may be denied in CI — the
  // component swallows that failure per its try/catch, so this only asserts no crash).
  await page.getByRole("button", { name: "Copy result" }).click();
});

test("a meeting with no clear purpose is recommended for cancellation regardless of other answers", async ({ page }) => {
  await page.goto("/tools/meeting-reset");
  await page.getByRole("button", { name: "Start the diagnostic" }).click();

  // Step 1: second option — "Vague or habitual."
  await answerCurrentStep(page, 1);
  await page.getByRole("button", { name: "Continue" }).click();

  // Remaining steps: first option each — would otherwise favour keeping the meeting.
  for (let step = 1; step < STEP_COUNT; step++) {
    await answerCurrentStep(page);
    const isLast = step === STEP_COUNT - 1;
    await page.getByRole("button", { name: isLast ? "See my verdict" : "Continue" }).click();
  }

  await expect(page.getByRole("heading", { name: "Verdict: Cancel it" })).toBeVisible();
});

test("keyboard-only visitor can complete the Meeting Usefulness Diagnostic", async ({ page }) => {
  await page.goto("/tools/meeting-reset");

  await page.getByRole("button", { name: "Start the diagnostic" }).focus();
  await page.keyboard.press("Enter");

  for (let step = 0; step < STEP_COUNT; step++) {
    await expect(page.getByText(`Question ${step + 1} of ${STEP_COUNT}`)).toBeVisible();

    const firstRadio = page.locator('fieldset input[type="radio"]').first();
    await firstRadio.focus();
    await page.keyboard.press(" ");
    await expect(firstRadio).toBeChecked();

    const isLast = step === STEP_COUNT - 1;
    const continueButton = page.getByRole("button", { name: isLast ? "See my verdict" : "Continue" });
    await continueButton.focus();
    await page.keyboard.press("Enter");
  }

  const resultHeading = page.getByRole("heading", { name: /^Verdict:/ });
  await expect(resultHeading).toBeVisible();
  // Spec §10.6/§32.4: focus moves to the result on completion.
  await expect(resultHeading).toBeFocused();
});

test.describe("mobile viewport", () => {
  // Deliberately just a viewport override, not a full `devices["iPhone 13"]` spread — the
  // full device preset sets `defaultBrowserType: "webkit"`, which this project (chromium
  // only, per playwright.config.ts) can't honour inside a describe-level `test.use`.
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("Meeting Usefulness Diagnostic is completable on a mobile viewport", async ({ page }) => {
    await page.goto("/tools/meeting-reset");
    await page.getByRole("button", { name: "Start the diagnostic" }).click();

    for (let step = 0; step < STEP_COUNT; step++) {
      await answerCurrentStep(page);
      const isLast = step === STEP_COUNT - 1;
      await page.getByRole("button", { name: isLast ? "See my verdict" : "Continue" }).click();
    }

    await expect(page.getByRole("heading", { name: /^Verdict:/ })).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";

// Mirrors tests/e2e/customer-demand-test-tool.spec.ts's coverage, generalised to the
// fourteenth and final Tier 2 Tool's 4-step flow (four named-candidate scoring questions,
// no gate — docs/decisions/0034).

const STEP_COUNT = 4;

/** Selects the option at `index` (default first) in the currently-visible step via pointer. */
async function answerCurrentStep(page: import("@playwright/test").Page, index = 0) {
  const radios = page.locator('fieldset input[type="radio"]');
  await radios.nth(index).check();
}

test("anonymous visitor can complete the Priority Scorer and see a recommendation", async ({ page }) => {
  await page.goto("/tools/product-prioritisation-tool");
  await expect(page.getByRole("heading", { name: "Priority Scorer", exact: false }).first()).toBeVisible();

  await page.getByRole("button", { name: "Start scoring your priorities" }).click();

  for (let step = 0; step < STEP_COUNT; step++) {
    await expect(page.getByText(`Question ${step + 1} of ${STEP_COUNT}`)).toBeVisible();
    await answerCurrentStep(page);
    const isLast = step === STEP_COUNT - 1;
    await page.getByRole("button", { name: isLast ? "See my result" : "Continue" }).click();
  }

  // First option every step: yes_hard_deadlines/yes_its_all_achievable/
  // roughly_equally_important/confidence_nothing_important_slips — scores Earliest Due Date
  // highest (6) ahead of Shortest Processing Time (3).
  await expect(page.getByRole("heading", { name: /^Your result: Earliest Due Date/ })).toBeVisible();
  await expect(page.getByText("Runner-up", { exact: true })).toBeVisible();
  await expect(page.getByText("Shortest Processing Time", { exact: true })).toBeVisible();

  // Copy result works without throwing (clipboard permission may be denied in CI — the
  // component swallows that failure per its try/catch, so this only asserts no crash).
  await page.getByRole("button", { name: "Copy result" }).click();
});

test("keyboard-only visitor can complete the Priority Scorer", async ({ page }) => {
  await page.goto("/tools/product-prioritisation-tool");

  await page.getByRole("button", { name: "Start scoring your priorities" }).focus();
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

  const resultHeading = page.getByRole("heading", { name: /^Your result:/ });
  await expect(resultHeading).toBeVisible();
  // Spec §10.6/§32.4: focus moves to the result on completion.
  await expect(resultHeading).toBeFocused();
});

test.describe("mobile viewport", () => {
  // Deliberately just a viewport override, not a full `devices["iPhone 13"]` spread — the
  // full device preset sets `defaultBrowserType: "webkit"`, which this project (chromium
  // only, per playwright.config.ts) can't honour inside a describe-level `test.use`.
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("Priority Scorer is completable on a mobile viewport", async ({ page }) => {
    await page.goto("/tools/product-prioritisation-tool");
    await page.getByRole("button", { name: "Start scoring your priorities" }).click();

    for (let step = 0; step < STEP_COUNT; step++) {
      await answerCurrentStep(page);
      const isLast = step === STEP_COUNT - 1;
      await page.getByRole("button", { name: isLast ? "See my result" : "Continue" }).click();
    }

    await expect(page.getByRole("heading", { name: /^Your result:/ })).toBeVisible();
  });
});

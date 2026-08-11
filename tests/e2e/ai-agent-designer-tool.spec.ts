import { test, expect } from "@playwright/test";

// Mirrors tests/e2e/meeting-reset-tool.spec.ts's coverage, generalised to the twenty-third
// Tool's 6-step flow. A gated decision tree with six reachable verdicts, not a scoring matrix
// (docs/decisions/0043).

const STEP_COUNT = 6;

/** Selects the option at `index` (default first) in the currently-visible step via pointer. */
async function answerCurrentStep(page: import("@playwright/test").Page, index = 0) {
  const radios = page.locator('fieldset input[type="radio"]');
  await radios.nth(index).check();
}

test("anonymous visitor can complete the Agent Architecture Check and see a recommendation", async ({ page }) => {
  await page.goto("/tools/ai-agent-designer");
  await expect(page.getByRole("heading", { name: "Agent Architecture Check", exact: false }).first()).toBeVisible();

  await page.getByRole("button", { name: "Start the questionnaire" }).click();

  for (let step = 0; step < STEP_COUNT; step++) {
    await expect(page.getByText(`Question ${step + 1} of ${STEP_COUNT}`)).toBeVisible();
    // First option every step: needs flexibility, then "no" to every pattern-matching
    // question — falls through every gate to the simplest agentic fallback.
    await answerCurrentStep(page);
    const isLast = step === STEP_COUNT - 1;
    await page.getByRole("button", { name: isLast ? "See my recommendation" : "Continue" }).click();
  }

  await expect(page.getByRole("heading", { name: "Verdict: Augmented LLM" })).toBeVisible();

  // Copy result works without throwing (clipboard permission may be denied in CI — the
  // component swallows that failure per its try/catch, so this only asserts no crash).
  await page.getByRole("button", { name: "Copy result" }).click();
});

test("a predictable, fixed-path task is recommended as a workflow regardless of other answers", async ({ page }) => {
  await page.goto("/tools/ai-agent-designer");
  await page.getByRole("button", { name: "Start the questionnaire" }).click();

  // Step 1: second option — "Yes, it's predictable and fixed."
  await answerCurrentStep(page, 1);
  await page.getByRole("button", { name: "Continue" }).click();

  // Remaining steps: first option each — would otherwise favour an agentic pattern.
  for (let step = 1; step < STEP_COUNT; step++) {
    await answerCurrentStep(page);
    const isLast = step === STEP_COUNT - 1;
    await page.getByRole("button", { name: isLast ? "See my recommendation" : "Continue" }).click();
  }

  await expect(page.getByRole("heading", { name: "Verdict: Use a workflow, not an agent" })).toBeVisible();
});

test("keyboard-only visitor can complete the Agent Architecture Check", async ({ page }) => {
  await page.goto("/tools/ai-agent-designer");

  await page.getByRole("button", { name: "Start the questionnaire" }).focus();
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

  test("Agent Architecture Check is completable on a mobile viewport", async ({ page }) => {
    await page.goto("/tools/ai-agent-designer");
    await page.getByRole("button", { name: "Start the questionnaire" }).click();

    for (let step = 0; step < STEP_COUNT; step++) {
      await answerCurrentStep(page);
      const isLast = step === STEP_COUNT - 1;
      await page.getByRole("button", { name: isLast ? "See my recommendation" : "Continue" }).click();
    }

    await expect(page.getByRole("heading", { name: /^Verdict:/ })).toBeVisible();
  });
});

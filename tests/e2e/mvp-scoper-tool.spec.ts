import { test, expect } from "@playwright/test";

// Mirrors tests/e2e/product-idea-assessor-tool.spec.ts's coverage (spec §32.3 flow #4
// generalised to the fourth Tool), including its 4-step flow — the shortest of the four
// Tools so far.

const STEP_COUNT = 4;

/** Selects the first option in the currently-visible step via mouse/pointer interaction. */
async function answerCurrentStepWithFirstOption(page: import("@playwright/test").Page) {
  const radios = page.locator('fieldset input[type="radio"]');
  await radios.first().check();
}

test("anonymous visitor can complete the Scope Decider Tool and see a result", async ({ page }) => {
  await page.goto("/tools/mvp-scoper");
  await expect(page.getByRole("heading", { name: "Scope Decider", exact: false }).first()).toBeVisible();

  await page.getByRole("button", { name: "Start scoring a feature" }).click();

  for (let step = 0; step < STEP_COUNT; step++) {
    await expect(page.getByText(`Question ${step + 1} of ${STEP_COUNT}`)).toBeVisible();
    await answerCurrentStepWithFirstOption(page);
    const isLast = step === STEP_COUNT - 1;
    await page.getByRole("button", { name: isLast ? "See my result" : "Continue" }).click();
  }

  // First option in every step is the weakest choice (nice to have, unrelated, low effort,
  // not fakeable), which scores 10 — below the defer threshold, so this run should remove.
  await expect(page.getByRole("heading", { name: /^Your result: Remove/ })).toBeVisible();
  await expect(page.getByText(/doesn't earn its place in the MVP scope/)).toBeVisible();

  // Copy result works without throwing (clipboard permission may be denied in CI — the
  // component swallows that failure per its try/catch, so this only asserts no crash).
  await page.getByRole("button", { name: "Copy result" }).click();
});

test("keyboard-only visitor can complete the Scope Decider Tool", async ({ page }) => {
  await page.goto("/tools/mvp-scoper");

  // Tab to and activate "Start scoring a feature".
  await page.getByRole("button", { name: "Start scoring a feature" }).focus();
  await page.keyboard.press("Enter");

  for (let step = 0; step < STEP_COUNT; step++) {
    await expect(page.getByText(`Question ${step + 1} of ${STEP_COUNT}`)).toBeVisible();

    // Focus the first radio in the group and select it with the keyboard (Space), never
    // a pointer click.
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

  test("Scope Decider Tool is completable on a mobile viewport", async ({ page }) => {
    await page.goto("/tools/mvp-scoper");
    await page.getByRole("button", { name: "Start scoring a feature" }).click();

    for (let step = 0; step < STEP_COUNT; step++) {
      await answerCurrentStepWithFirstOption(page);
      const isLast = step === STEP_COUNT - 1;
      await page.getByRole("button", { name: isLast ? "See my result" : "Continue" }).click();
    }

    await expect(page.getByRole("heading", { name: /^Your result:/ })).toBeVisible();
  });
});

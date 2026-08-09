import { test, expect } from "@playwright/test";

// Mirrors tests/e2e/better-decision-maker-tool.spec.ts's coverage (spec §32.3 flow #4
// generalised to the fifth Tool), including its 8-step flow (4 questions x 2 names).

const STEP_COUNT = 8;

/** Selects the first option in the currently-visible step via mouse/pointer interaction. */
async function answerCurrentStepWithFirstOption(page: import("@playwright/test").Page) {
  const radios = page.locator('fieldset input[type="radio"]');
  await radios.first().check();
}

test("anonymous visitor can complete the Name Comparator Tool and see a result", async ({ page }) => {
  await page.goto("/tools/product-naming-system");
  await expect(page.getByRole("heading", { name: "Name Comparator", exact: false }).first()).toBeVisible();

  await page.getByRole("button", { name: "Start comparing two names" }).click();

  for (let step = 0; step < STEP_COUNT; step++) {
    await expect(page.getByText(`Question ${step + 1} of ${STEP_COUNT}`)).toBeVisible();
    await answerCurrentStepWithFirstOption(page);
    const isLast = step === STEP_COUNT - 1;
    await page.getByRole("button", { name: isLast ? "See my result" : "Continue" }).click();
  }

  await expect(page.getByRole("heading", { name: "Your result" })).toBeVisible();
  // First option in every step is the weakest choice for both names (low/low/low, taken
  // everywhere), so both are disqualified and neither should be recommended.
  await expect(page.getByText("Neither name is usable as-is")).toBeVisible();
  await expect(page.getByText("Not usable — taken everywhere").first()).toBeVisible();

  // Copy result works without throwing (clipboard permission may be denied in CI — the
  // component swallows that failure per its try/catch, so this only asserts no crash).
  await page.getByRole("button", { name: "Copy result" }).click();
});

test("keyboard-only visitor can complete the Name Comparator Tool", async ({ page }) => {
  await page.goto("/tools/product-naming-system");

  // Tab to and activate "Start comparing two names".
  await page.getByRole("button", { name: "Start comparing two names" }).focus();
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

  const resultHeading = page.getByRole("heading", { name: "Your result" });
  await expect(resultHeading).toBeVisible();
  // Spec §10.6/§32.4: focus moves to the result on completion.
  await expect(resultHeading).toBeFocused();
});

test.describe("mobile viewport", () => {
  // Deliberately just a viewport override, not a full `devices["iPhone 13"]` spread — the
  // full device preset sets `defaultBrowserType: "webkit"`, which this project (chromium
  // only, per playwright.config.ts) can't honour inside a describe-level `test.use`.
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("Name Comparator Tool is completable on a mobile viewport", async ({ page }) => {
    await page.goto("/tools/product-naming-system");
    await page.getByRole("button", { name: "Start comparing two names" }).click();

    for (let step = 0; step < STEP_COUNT; step++) {
      await answerCurrentStepWithFirstOption(page);
      const isLast = step === STEP_COUNT - 1;
      await page.getByRole("button", { name: isLast ? "See my result" : "Continue" }).click();
    }

    await expect(page.getByRole("heading", { name: "Your result" })).toBeVisible();
  });
});

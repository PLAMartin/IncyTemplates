import { test, expect } from "@playwright/test";

// Mirrors tests/e2e/product-market-fit-tracker-tool.spec.ts's coverage generalised to the
// eighth Tool, including its 4-step flow (four named-candidate scoring questions).

const STEP_COUNT = 4;

/** Selects the option at `index` (default first) in the currently-visible step via pointer. */
async function answerCurrentStep(page: import("@playwright/test").Page, index = 0) {
  const radios = page.locator('fieldset input[type="radio"]');
  await radios.nth(index).check();
}

test("anonymous visitor can complete the Pricing Model Recommender and see a recommendation", async ({ page }) => {
  await page.goto("/tools/pricing-your-product");
  await expect(page.getByRole("heading", { name: "Pricing Model Recommender", exact: false }).first()).toBeVisible();

  await page.getByRole("button", { name: "Start choosing a pricing model" }).click();

  for (let step = 0; step < STEP_COUNT; step++) {
    await expect(page.getByText(`Question ${step + 1} of ${STEP_COUNT}`)).toBeVisible();
    await answerCurrentStep(page);
    const isLast = step === STEP_COUNT - 1;
    await page.getByRole("button", { name: isLast ? "See my result" : "Continue" }).click();
  }

  // First option every step: ongoing, clear, individual, highly_visible — scores usage-based
  // highest (6) ahead of a flat/tiered tie broken toward flat-rate subscription.
  await expect(page.getByRole("heading", { name: /^Your result: Usage-based pricing/ })).toBeVisible();
  await expect(page.getByText("Runner-up", { exact: true })).toBeVisible();
  await expect(page.getByText("Flat-rate subscription", { exact: true })).toBeVisible();

  // Copy result works without throwing (clipboard permission may be denied in CI — the
  // component swallows that failure per its try/catch, so this only asserts no crash).
  await page.getByRole("button", { name: "Copy result" }).click();
});

test("choosing a one-off job rules out every subscription model regardless of the other answers", async ({ page }) => {
  await page.goto("/tools/pricing-your-product");
  await page.getByRole("button", { name: "Start choosing a pricing model" }).click();

  // Step 1: "One-off" is the second option.
  await answerCurrentStep(page, 1);
  await page.getByRole("button", { name: "Continue" }).click();

  // Remaining steps: first option each — would otherwise favour a subscription model.
  for (let step = 1; step < STEP_COUNT; step++) {
    await answerCurrentStep(page);
    const isLast = step === STEP_COUNT - 1;
    await page.getByRole("button", { name: isLast ? "See my result" : "Continue" }).click();
  }

  await expect(page.getByRole("heading", { name: /^Your result: One-time purchase/ })).toBeVisible();
  await expect(page.getByText("Subscription models ruled out — one-off job")).toBeVisible();
});

test("keyboard-only visitor can complete the Pricing Model Recommender", async ({ page }) => {
  await page.goto("/tools/pricing-your-product");

  // Tab to and activate "Start choosing a pricing model".
  await page.getByRole("button", { name: "Start choosing a pricing model" }).focus();
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

  test("Pricing Model Recommender is completable on a mobile viewport", async ({ page }) => {
    await page.goto("/tools/pricing-your-product");
    await page.getByRole("button", { name: "Start choosing a pricing model" }).click();

    for (let step = 0; step < STEP_COUNT; step++) {
      await answerCurrentStep(page);
      const isLast = step === STEP_COUNT - 1;
      await page.getByRole("button", { name: isLast ? "See my result" : "Continue" }).click();
    }

    await expect(page.getByRole("heading", { name: /^Your result:/ })).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";

// Mirrors tests/e2e/product-idea-assessor-tool.spec.ts's coverage (spec §32.3 flow #4
// generalised to the sixth and final Tool), including its 5-step flow (channel type +
// 4 fit questions) — the same step count as the very first Tool.

const STEP_COUNT = 5;

/** Selects the first option in the currently-visible step via mouse/pointer interaction. */
async function answerCurrentStepWithFirstOption(page: import("@playwright/test").Page) {
  const radios = page.locator('fieldset input[type="radio"]');
  await radios.first().check();
}

test("anonymous visitor can complete the Channel Selector Tool and see a result", async ({ page }) => {
  await page.goto("/tools/first-customers-planner");
  await expect(page.getByRole("heading", { name: "Channel Selector", exact: false }).first()).toBeVisible();

  await page.getByRole("button", { name: "Start scoring a channel" }).click();

  for (let step = 0; step < STEP_COUNT; step++) {
    await expect(page.getByText(`Question ${step + 1} of ${STEP_COUNT}`)).toBeVisible();
    await answerCurrentStepWithFirstOption(page);
    const isLast = step === STEP_COUNT - 1;
    await page.getByRole("button", { name: isLast ? "See my result" : "Continue" }).click();
  }

  // First option in every step: cold outreach, low audience presence, low founder fit, low
  // effort (inverted — this is actually the best choice), low repeatability. Score = 15,
  // below the worth-testing threshold, so this run should read as a weak fit.
  await expect(page.getByRole("heading", { name: /^Your result: Cold outreach/ })).toBeVisible();
  await expect(page.getByText("Weak fit")).toBeVisible();
  await expect(page.getByText(/Fit score/)).toBeVisible();

  // Copy result works without throwing (clipboard permission may be denied in CI — the
  // component swallows that failure per its try/catch, so this only asserts no crash).
  await page.getByRole("button", { name: "Copy result" }).click();
});

test("keyboard-only visitor can complete the Channel Selector Tool", async ({ page }) => {
  await page.goto("/tools/first-customers-planner");

  // Tab to and activate "Start scoring a channel".
  await page.getByRole("button", { name: "Start scoring a channel" }).focus();
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

  test("Channel Selector Tool is completable on a mobile viewport", async ({ page }) => {
    await page.goto("/tools/first-customers-planner");
    await page.getByRole("button", { name: "Start scoring a channel" }).click();

    for (let step = 0; step < STEP_COUNT; step++) {
      await answerCurrentStepWithFirstOption(page);
      const isLast = step === STEP_COUNT - 1;
      await page.getByRole("button", { name: isLast ? "See my result" : "Continue" }).click();
    }

    await expect(page.getByRole("heading", { name: /^Your result:/ })).toBeVisible();
  });
});

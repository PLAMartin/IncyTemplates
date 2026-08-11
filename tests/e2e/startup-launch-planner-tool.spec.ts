import { test, expect } from "@playwright/test";

// Mirrors tests/e2e/business-model-chooser-tool.spec.ts's coverage, generalised to the
// nineteenth Tool's 4-step flow. Unlike every prior scoring Tool, the result shows a full
// ranked plan (all four options), not just a winner and runner-up (docs/decisions/0038).

const STEP_COUNT = 4;

/** Selects the option at `index` (default first) in the currently-visible step via pointer. */
async function answerCurrentStep(page: import("@playwright/test").Page, index = 0) {
  const radios = page.locator('fieldset input[type="radio"]');
  await radios.nth(index).check();
}

test("anonymous visitor can generate a full launch plan", async ({ page }) => {
  await page.goto("/tools/startup-launch-planner");
  await expect(page.getByRole("heading", { name: "Launch Plan Generator", exact: false }).first()).toBeVisible();

  await page.getByRole("button", { name: "Start planning my launch" }).click();

  for (let step = 0; step < STEP_COUNT; step++) {
    await expect(page.getByText(`Question ${step + 1} of ${STEP_COUNT}`)).toBeVisible();
    await answerCurrentStep(page);
    const isLast = step === STEP_COUNT - 1;
    await page.getByRole("button", { name: isLast ? "See my plan" : "Continue" }).click();
  }

  // First option every step: yes_a_working_version_or_page/want_low_stakes_honest_feedback_
  // first/yes_i_already_have_some_following_or_community_ties/yes_genuinely_novel_or_a_good_
  // story — a three-way tie at 5 points, resolved by fixed OPTION_ORDER toward Friends and
  // family, ahead of Community or social and Press.
  await expect(page.getByRole("heading", { name: "Your launch plan" })).toBeVisible();
  await expect(page.getByText("Start here", { exact: true })).toBeVisible();
  await expect(page.getByText("Friends and family", { exact: true })).toBeVisible();
  await expect(page.getByText("Community or social", { exact: true })).toBeVisible();
  await expect(page.getByText("Press", { exact: true })).toBeVisible();
  await expect(page.getByText("Soft launch page", { exact: true })).toBeVisible();

  // Copy result works without throwing (clipboard permission may be denied in CI — the
  // component swallows that failure per its try/catch, so this only asserts no crash).
  await page.getByRole("button", { name: "Copy result" }).click();
});

test("keyboard-only visitor can generate a launch plan", async ({ page }) => {
  await page.goto("/tools/startup-launch-planner");

  await page.getByRole("button", { name: "Start planning my launch" }).focus();
  await page.keyboard.press("Enter");

  for (let step = 0; step < STEP_COUNT; step++) {
    await expect(page.getByText(`Question ${step + 1} of ${STEP_COUNT}`)).toBeVisible();

    const firstRadio = page.locator('fieldset input[type="radio"]').first();
    await firstRadio.focus();
    await page.keyboard.press(" ");
    await expect(firstRadio).toBeChecked();

    const isLast = step === STEP_COUNT - 1;
    const continueButton = page.getByRole("button", { name: isLast ? "See my plan" : "Continue" });
    await continueButton.focus();
    await page.keyboard.press("Enter");
  }

  const resultHeading = page.getByRole("heading", { name: "Your launch plan" });
  await expect(resultHeading).toBeVisible();
  // Spec §10.6/§32.4: focus moves to the result on completion.
  await expect(resultHeading).toBeFocused();
});

test.describe("mobile viewport", () => {
  // Deliberately just a viewport override, not a full `devices["iPhone 13"]` spread — the
  // full device preset sets `defaultBrowserType: "webkit"`, which this project (chromium
  // only, per playwright.config.ts) can't honour inside a describe-level `test.use`.
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("Launch Plan Generator is completable on a mobile viewport", async ({ page }) => {
    await page.goto("/tools/startup-launch-planner");
    await page.getByRole("button", { name: "Start planning my launch" }).click();

    for (let step = 0; step < STEP_COUNT; step++) {
      await answerCurrentStep(page);
      const isLast = step === STEP_COUNT - 1;
      await page.getByRole("button", { name: isLast ? "See my plan" : "Continue" }).click();
    }

    await expect(page.getByRole("heading", { name: "Your launch plan" })).toBeVisible();
  });
});

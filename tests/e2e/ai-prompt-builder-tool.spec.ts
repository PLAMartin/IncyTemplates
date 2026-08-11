import { test, expect } from "@playwright/test";

// Mirrors tests/e2e/product-positioning-builder-tool.spec.ts's coverage, generalised to the
// twenty-second Tool's 5-step flow: three required free-text steps, one optional free-text
// step, and one required select — no scoring matrix, just CARE prompt assembly plus a direct
// either/or toggle for the question-flip addendum (docs/decisions/0042).

test("anonymous visitor can build a prompt from the CARE framework", async ({ page }) => {
  await page.goto("/tools/ai-prompt-builder");
  await expect(page.getByRole("heading", { name: "Prompt Builder", exact: false }).first()).toBeVisible();

  await page.getByRole("button", { name: "Start building your prompt" }).click();

  await expect(page.getByText("Question 1 of 5")).toBeVisible();
  await page.getByLabel(/Context/).fill("You're a nutritionist helping a busy parent plan meals.");
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByText("Question 2 of 5")).toBeVisible();
  await page.getByLabel(/Action/).fill("Create a 7-day vegetarian meal plan with calorie counts.");
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByText("Question 3 of 5")).toBeVisible();
  await page.getByLabel(/Result/).fill("A table with one row per day.");
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 4 (optional Example): leave blank, just continue.
  await expect(page.getByText("Question 4 of 5")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 5 (select): first option is "Yes, ask me questions first".
  await expect(page.getByText("Question 5 of 5")).toBeVisible();
  await page.locator('fieldset input[type="radio"]').first().check();
  await page.getByRole("button", { name: "See my prompt" }).click();

  await expect(page.getByRole("heading", { name: "Your prompt" })).toBeVisible();
  await expect(page.getByText("Context: You're a nutritionist helping a busy parent plan meals.")).toBeVisible();
  await expect(page.getByText(/ask me one question at a time/)).toBeVisible();

  // Copy result works without throwing (clipboard permission may be denied in CI — the
  // component swallows that failure per its try/catch, so this only asserts no crash).
  await page.getByRole("button", { name: "Copy result" }).click();
});

test("choosing not to add the question-flip instruction leaves it out of the prompt", async ({ page }) => {
  await page.goto("/tools/ai-prompt-builder");
  await page.getByRole("button", { name: "Start building your prompt" }).click();

  await page.getByLabel(/Context/).fill("A nutritionist.");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel(/Action/).fill("Create a meal plan.");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel(/Result/).fill("A table.");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  // Second option: "No, just the prompt".
  await page.locator('fieldset input[type="radio"]').nth(1).check();
  await page.getByRole("button", { name: "See my prompt" }).click();

  await expect(page.getByRole("heading", { name: "Your prompt" })).toBeVisible();
  await expect(page.getByText(/ask me one question at a time/)).toHaveCount(0);
});

test("leaving a required free-text answer blank shows an actionable error instead of advancing", async ({ page }) => {
  await page.goto("/tools/ai-prompt-builder");
  await page.getByRole("button", { name: "Start building your prompt" }).click();

  await expect(page.getByText("Question 1 of 5")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.locator('p[role="alert"]')).toContainText("This answer is needed");
  // Still on the same step, not advanced.
  await expect(page.getByText("Question 1 of 5")).toBeVisible();
});

test("keyboard-only visitor can complete the Prompt Builder", async ({ page }) => {
  await page.goto("/tools/ai-prompt-builder");

  await page.getByRole("button", { name: "Start building your prompt" }).focus();
  await page.keyboard.press("Enter");

  const fields = ["A nutritionist.", "Create a meal plan.", "A table."];
  for (let step = 0; step < fields.length; step++) {
    await expect(page.getByText(`Question ${step + 1} of 5`)).toBeVisible();
    await page.locator("textarea").focus();
    await page.keyboard.type(fields[step]!);
    await page.getByRole("button", { name: "Continue" }).focus();
    await page.keyboard.press("Enter");
  }

  // Step 4 (optional): skip without typing.
  await expect(page.getByText("Question 4 of 5")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).focus();
  await page.keyboard.press("Enter");

  // Step 5 (select).
  await expect(page.getByText("Question 5 of 5")).toBeVisible();
  const firstRadio = page.locator('fieldset input[type="radio"]').first();
  await firstRadio.focus();
  await page.keyboard.press(" ");
  await expect(firstRadio).toBeChecked();
  await page.getByRole("button", { name: "See my prompt" }).focus();
  await page.keyboard.press("Enter");

  const resultHeading = page.getByRole("heading", { name: "Your prompt" });
  await expect(resultHeading).toBeVisible();
  // Spec §10.6/§32.4: focus moves to the result on completion.
  await expect(resultHeading).toBeFocused();
});

test.describe("mobile viewport", () => {
  // Deliberately just a viewport override, not a full `devices["iPhone 13"]` spread — the
  // full device preset sets `defaultBrowserType: "webkit"`, which this project (chromium
  // only, per playwright.config.ts) can't honour inside a describe-level `test.use`.
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("Prompt Builder is completable on a mobile viewport", async ({ page }) => {
    await page.goto("/tools/ai-prompt-builder");
    await page.getByRole("button", { name: "Start building your prompt" }).click();

    await page.getByLabel(/Context/).fill("A nutritionist.");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByLabel(/Action/).fill("Create a meal plan.");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByLabel(/Result/).fill("A table.");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.locator('fieldset input[type="radio"]').first().check();
    await page.getByRole("button", { name: "See my prompt" }).click();

    await expect(page.getByRole("heading", { name: "Your prompt" })).toBeVisible();
  });
});

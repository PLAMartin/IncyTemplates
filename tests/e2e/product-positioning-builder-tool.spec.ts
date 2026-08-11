import { test, expect } from "@playwright/test";

// Mirrors tests/e2e/product-idea-generator-tool.spec.ts's coverage, generalised to the
// twelfth Tool's 5-step flow: three required free-text steps, one optional free-text step,
// and one required select — no scoring matrix this time, just statement assembly plus a
// direct-lookup tactic recommendation (docs/decisions/0032).

test("anonymous visitor can build a positioning statement and get a recommended tactic", async ({ page }) => {
  await page.goto("/tools/product-positioning-builder");
  await expect(page.getByRole("heading", { name: "Positioning Statement Builder", exact: false }).first()).toBeVisible();

  await page.getByRole("button", { name: "Start building your positioning" }).click();

  await expect(page.getByText("Question 1 of 5")).toBeVisible();
  await page.getByLabel(/Who's your ideal customer/).fill("solo founders validating a new product idea");
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByText("Question 2 of 5")).toBeVisible();
  await page.getByLabel(/What action do you want them to take/).fill("score their idea in under five minutes");
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByText("Question 3 of 5")).toBeVisible();
  await page.getByLabel(/What outcome do they get/).fill("know exactly how much evidence they still need before committing");
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 4 (optional): leave blank, just continue.
  await expect(page.getByText("Question 4 of 5")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 5 (select): first option is "A problem people actively worry about" -> scary.
  await expect(page.getByText("Question 5 of 5")).toBeVisible();
  await page.locator('fieldset input[type="radio"]').first().check();
  await page.getByRole("button", { name: "See my result" }).click();

  await expect(page.getByRole("heading", { name: "Your positioning statement" })).toBeVisible();
  await expect(
    page.getByText(
      "When solo founders validating a new product idea score their idea in under five minutes, they get know exactly how much evidence they still need before committing.",
    ),
  ).toBeVisible();
  await expect(page.getByText("Scary", { exact: true })).toBeVisible();

  // Copy result works without throwing (clipboard permission may be denied in CI — the
  // component swallows that failure per its try/catch, so this only asserts no crash).
  await page.getByRole("button", { name: "Copy result" }).click();
});

test("leaving a required free-text answer blank shows an actionable error instead of advancing", async ({ page }) => {
  await page.goto("/tools/product-positioning-builder");
  await page.getByRole("button", { name: "Start building your positioning" }).click();

  await expect(page.getByText("Question 1 of 5")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.locator('p[role="alert"]')).toContainText("This answer is needed");
  // Still on the same step, not advanced.
  await expect(page.getByText("Question 1 of 5")).toBeVisible();
});

test("keyboard-only visitor can complete the Positioning Statement Builder", async ({ page }) => {
  await page.goto("/tools/product-positioning-builder");

  await page.getByRole("button", { name: "Start building your positioning" }).focus();
  await page.keyboard.press("Enter");

  const fields = [
    "solo founders validating a new product idea",
    "score their idea in under five minutes",
    "know exactly how much evidence they still need before committing",
  ];
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
  await page.getByRole("button", { name: "See my result" }).focus();
  await page.keyboard.press("Enter");

  const resultHeading = page.getByRole("heading", { name: "Your positioning statement" });
  await expect(resultHeading).toBeVisible();
  // Spec §10.6/§32.4: focus moves to the result on completion.
  await expect(resultHeading).toBeFocused();
});

test.describe("mobile viewport", () => {
  // Deliberately just a viewport override, not a full `devices["iPhone 13"]` spread — the
  // full device preset sets `defaultBrowserType: "webkit"`, which this project (chromium
  // only, per playwright.config.ts) can't honour inside a describe-level `test.use`.
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("Positioning Statement Builder is completable on a mobile viewport", async ({ page }) => {
    await page.goto("/tools/product-positioning-builder");
    await page.getByRole("button", { name: "Start building your positioning" }).click();

    await page.getByLabel(/Who's your ideal customer/).fill("solo founders");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByLabel(/What action do you want them to take/).fill("score their idea");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByLabel(/What outcome do they get/).fill("know what to do next");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.locator('fieldset input[type="radio"]').first().check();
    await page.getByRole("button", { name: "See my result" }).click();

    await expect(page.getByRole("heading", { name: "Your positioning statement" })).toBeVisible();
  });
});

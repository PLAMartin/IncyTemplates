import { test, expect } from "@playwright/test";

// Mirrors tests/e2e/product-idea-generator-tool.spec.ts's coverage, generalised to the
// seventeenth Tool's 5-step, all-optional flow — a completeness checker, not a scorer
// (docs/decisions/0037).

test("anonymous visitor can check a partial story spine and see what's missing", async ({ page }) => {
  await page.goto("/tools/story-builder");
  await expect(page.getByRole("heading", { name: "Story Structure Checker", exact: false }).first()).toBeVisible();

  await page.getByRole("button", { name: "Start checking your story" }).click();

  await expect(page.getByText("Question 1 of 5")).toBeVisible();
  await page.getByLabel(/Place — where does the scene happen/).fill("The lift hums as it carries me up to the 7th floor.");
  await page.getByRole("button", { name: "Continue" }).click();

  // Steps 2-4: leave blank, just continue.
  for (const questionNumber of [2, 3, 4]) {
    await expect(page.getByText(`Question ${questionNumber} of 5`)).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();
  }

  // Step 5: leave blank too, then check.
  await expect(page.getByText("Question 5 of 5")).toBeVisible();
  await page.getByRole("button", { name: "Check my structure" }).click();

  await expect(page.getByRole("heading", { name: "4 parts still missing" })).toBeVisible();
  await expect(page.getByText("The lift hums as it carries me up to the 7th floor.").first()).toBeVisible();
  await expect(page.getByText("Not written yet.").first()).toBeVisible();
  // Place was filled, so the tip should point at the next missing element, Action.
  await expect(page.getByText(/Use verbs/)).toBeVisible();

  // Copy result works without throwing (clipboard permission may be denied in CI — the
  // component swallows that failure per its try/catch, so this only asserts no crash).
  await page.getByRole("button", { name: "Copy result" }).click();
});

test("leaving every element blank shows an actionable error instead of completing", async ({ page }) => {
  await page.goto("/tools/story-builder");
  await page.getByRole("button", { name: "Start checking your story" }).click();

  for (let i = 0; i < 4; i++) {
    await page.getByRole("button", { name: "Continue" }).click();
  }
  await page.getByRole("button", { name: "Check my structure" }).click();

  await expect(page.locator('p[role="alert"]')).toContainText("Enter at least one element above");
  await expect(page.getByRole("heading", { name: /parts still missing|story spine is complete/ })).not.toBeVisible();
});

test("keyboard-only visitor can check their story structure", async ({ page }) => {
  await page.goto("/tools/story-builder");

  await page.getByRole("button", { name: "Start checking your story" }).focus();
  await page.keyboard.press("Enter");

  await expect(page.getByText("Question 1 of 5")).toBeVisible();
  await page.locator("textarea").focus();
  await page.keyboard.type("The airport.");
  await page.getByRole("button", { name: "Continue" }).focus();
  await page.keyboard.press("Enter");

  for (const questionNumber of [2, 3, 4]) {
    await expect(page.getByText(`Question ${questionNumber} of 5`)).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).focus();
    await page.keyboard.press("Enter");
  }

  await expect(page.getByText("Question 5 of 5")).toBeVisible();
  await page.getByRole("button", { name: "Check my structure" }).focus();
  await page.keyboard.press("Enter");

  const resultHeading = page.getByRole("heading", { name: /parts still missing/ });
  await expect(resultHeading).toBeVisible();
  // Spec §10.6/§32.4: focus moves to the result on completion.
  await expect(resultHeading).toBeFocused();
});

test.describe("mobile viewport", () => {
  // Deliberately just a viewport override, not a full `devices["iPhone 13"]` spread — the
  // full device preset sets `defaultBrowserType: "webkit"`, which this project (chromium
  // only, per playwright.config.ts) can't honour inside a describe-level `test.use`.
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("Story Structure Checker is completable on a mobile viewport", async ({ page }) => {
    await page.goto("/tools/story-builder");
    await page.getByRole("button", { name: "Start checking your story" }).click();

    await page.getByLabel(/Place — where does the scene happen/).fill("The airport.");
    for (let i = 0; i < 4; i++) {
      await page.getByRole("button", { name: "Continue" }).click();
    }
    await page.getByRole("button", { name: "Check my structure" }).click();

    await expect(page.getByRole("heading", { name: /parts still missing/ })).toBeVisible();
  });
});

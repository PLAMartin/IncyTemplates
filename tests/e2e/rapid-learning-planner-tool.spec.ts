import { test, expect } from "@playwright/test";

// Mirrors tests/e2e/negotiation-prep-tool.spec.ts's coverage, generalised to the twenty-sixth
// Tool's 4-step, all-optional flow — a completeness checker, not a scorer (docs/decisions/0060).

test("anonymous visitor can check a partial learning plan and see what's missing", async ({ page }) => {
  await page.goto("/tools/rapid-learning-planner");
  await expect(page.getByRole("heading", { name: "Rapid Learning Plan Check", exact: false }).first()).toBeVisible();

  await page.getByRole("button", { name: "Start checking your plan" }).click();

  await expect(page.getByText("Question 1 of 4")).toBeVisible();
  await page.getByLabel(/Deconstruction — what are the smaller/).fill("Prompting, debugging, iterating, workflows.");
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 2: leave blank, just continue.
  await expect(page.getByText("Question 2 of 4")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 3: leave blank too.
  await expect(page.getByText("Question 3 of 4")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 4: leave blank too, then check.
  await expect(page.getByText("Question 4 of 4")).toBeVisible();
  await page.getByRole("button", { name: "Check my plan" }).click();

  await expect(page.getByRole("heading", { name: "3 steps still to plan" })).toBeVisible();
  await expect(page.getByText("Prompting, debugging, iterating, workflows.").first()).toBeVisible();
  await expect(page.getByText("Not planned yet.").first()).toBeVisible();
  // Deconstruction was filled, so the tip should point at the next missing step, Selection.
  await expect(page.getByText(/20%/)).toBeVisible();

  // Copy result works without throwing (clipboard permission may be denied in CI — the
  // component swallows that failure per its try/catch, so this only asserts no crash).
  await page.getByRole("button", { name: "Copy result" }).click();
});

test("leaving every step blank shows an actionable error instead of completing", async ({ page }) => {
  await page.goto("/tools/rapid-learning-planner");
  await page.getByRole("button", { name: "Start checking your plan" }).click();

  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: "Continue" }).click();
  }
  await page.getByRole("button", { name: "Check my plan" }).click();

  await expect(page.locator('p[role="alert"]')).toContainText("Enter at least one step above");
  await expect(page.getByRole("heading", { name: /steps still to plan|plan is ready/ })).not.toBeVisible();
});

test("keyboard-only visitor can check their learning plan", async ({ page }) => {
  await page.goto("/tools/rapid-learning-planner");

  await page.getByRole("button", { name: "Start checking your plan" }).focus();
  await page.keyboard.press("Enter");

  await expect(page.getByText("Question 1 of 4")).toBeVisible();
  await page.locator("textarea").focus();
  await page.keyboard.type("Break the skill into its parts.");
  await page.getByRole("button", { name: "Continue" }).focus();
  await page.keyboard.press("Enter");

  for (let i = 0; i < 2; i++) {
    await page.getByRole("button", { name: "Continue" }).focus();
    await page.keyboard.press("Enter");
  }

  await page.getByRole("button", { name: "Check my plan" }).focus();
  await page.keyboard.press("Enter");

  const resultHeading = page.getByRole("heading", { name: /steps still to plan/ });
  await expect(resultHeading).toBeVisible();
  // Spec §10.6/§32.4: focus moves to the result on completion.
  await expect(resultHeading).toBeFocused();
});

test.describe("mobile viewport", () => {
  // Deliberately just a viewport override, not a full `devices["iPhone 13"]` spread — the
  // full device preset sets `defaultBrowserType: "webkit"`, which this project (chromium
  // only, per playwright.config.ts) can't honour inside a describe-level `test.use`.
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("Rapid Learning Plan Check is completable on a mobile viewport", async ({ page }) => {
    await page.goto("/tools/rapid-learning-planner");
    await page.getByRole("button", { name: "Start checking your plan" }).click();

    await page.getByLabel(/Deconstruction — what are the smaller/).fill("Break the skill into its parts.");
    for (let i = 0; i < 3; i++) {
      await page.getByRole("button", { name: "Continue" }).click();
    }
    await page.getByRole("button", { name: "Check my plan" }).click();

    await expect(page.getByRole("heading", { name: /steps still to plan/ })).toBeVisible();
  });
});

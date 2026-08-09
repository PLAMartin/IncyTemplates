import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Automated axe scans catch a subset of WCAG issues (spec §32.4) — they
 * don't replace manual keyboard/screen-reader/zoom testing, but they run
 * on every PR for free and catch regressions early.
 */
async function expectNoSeriousViolations(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
    .analyze();

  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );

  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
}

test("homepage has no serious/critical axe violations", async ({ page }) => {
  await page.goto("/");
  await expectNoSeriousViolations(page);
});

test("catalogue has no serious/critical axe violations", async ({ page }) => {
  await page.goto("/templates");
  await expectNoSeriousViolations(page);
});

test("a product page has no serious/critical axe violations", async ({ page }) => {
  await page.goto("/templates");
  const firstProductLink = page.locator('a[href^="/templates/"]').first();
  await firstProductLink.click();
  await expectNoSeriousViolations(page);
});

test("a guide page has no serious/critical axe violations", async ({ page }) => {
  await page.goto("/guides");
  const firstGuideLink = page.locator('a[href^="/guides/"]').first();
  await firstGuideLink.click();
  await expectNoSeriousViolations(page);
});

test("the product family page has no serious/critical axe violations", async ({ page }) => {
  await page.goto("/products/product-idea-assessor");
  await expectNoSeriousViolations(page);
});

test("the Tool's start state has no serious/critical axe violations", async ({ page }) => {
  await page.goto("/tools/product-idea-assessor");
  await expectNoSeriousViolations(page);
});

test("the Tool's in-progress state has no serious/critical axe violations", async ({ page }) => {
  await page.goto("/tools/product-idea-assessor");
  await page.getByRole("button", { name: "Start the assessment" }).click();
  await expectNoSeriousViolations(page);
});

test("the Tool's result state has no serious/critical axe violations", async ({ page }) => {
  await page.goto("/tools/product-idea-assessor");
  await page.getByRole("button", { name: "Start the assessment" }).click();
  for (let step = 0; step < 5; step++) {
    await page.locator('fieldset input[type="radio"]').first().check();
    const isLast = step === 4;
    await page.getByRole("button", { name: isLast ? "See my result" : "Continue" }).click();
  }
  await expect(page.getByRole("heading", { name: /^Your result:/ })).toBeVisible();
  await expectNoSeriousViolations(page);
});

test("the Next Step Finder's start state has no serious/critical axe violations", async ({ page }) => {
  await page.goto("/finder");
  await expectNoSeriousViolations(page);
});

test("the Next Step Finder's in-progress state has no serious/critical axe violations", async ({ page }) => {
  await page.goto("/finder");
  await page.getByRole("button", { name: "Find my next step" }).click();
  await expectNoSeriousViolations(page);
});

test("the Next Step Finder's result state has no serious/critical axe violations", async ({ page }) => {
  await page.goto("/finder");
  await page.getByRole("button", { name: "Find my next step" }).click();
  for (let step = 0; step < 3; step++) {
    await page.locator('fieldset input[type="radio"]').first().check();
    const isLast = step === 2;
    await page.getByRole("button", { name: isLast ? "See my recommendation" : "Continue" }).click();
  }
  await expect(page.getByRole("heading", { name: "Your recommendation" })).toBeVisible();
  await expectNoSeriousViolations(page);
});

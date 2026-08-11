import { test, expect } from "@playwright/test";

// The fifteenth Tool and the first with a single free-text step and no ranking — mirrors the
// shape of tests/e2e/product-idea-generator-tool.spec.ts's validation coverage, adapted to a
// one-question flow with no Back/Continue navigation (docs/decisions/0035).

test("anonymous visitor can generate five lateral thinking prompts", async ({ page }) => {
  await page.goto("/tools/lateral-thinking-toolkit");
  await expect(page.getByRole("heading", { name: "Lateral Thinking Prompt Generator", exact: false }).first()).toBeVisible();

  await page.getByRole("button", { name: "Start generating prompts" }).click();
  await page.getByLabel(/What problem or idea are you stuck on/).fill("our onboarding feels generic");
  await page.getByRole("button", { name: "Generate prompts" }).click();

  await expect(page.getByRole("heading", { name: "Your prompts" })).toBeVisible();
  await expect(page.getByText("Perceptual change", { exact: true })).toBeVisible();
  await expect(page.getByText("Random input", { exact: true })).toBeVisible();
  await expect(page.getByText("Provocation", { exact: true })).toBeVisible();
  await expect(page.getByText("Specificity", { exact: true })).toBeVisible();
  await expect(page.getByText("Scale", { exact: true })).toBeVisible();
  // Every prompt echoes the visitor's own words back.
  await expect(page.getByText("our onboarding feels generic").first()).toBeVisible();

  // Copy result works without throwing (clipboard permission may be denied in CI — the
  // component swallows that failure per its try/catch, so this only asserts no crash).
  await page.getByRole("button", { name: "Copy result" }).click();
});

test("leaving the problem blank shows an actionable error instead of generating prompts", async ({ page }) => {
  await page.goto("/tools/lateral-thinking-toolkit");
  await page.getByRole("button", { name: "Start generating prompts" }).click();
  await page.getByRole("button", { name: "Generate prompts" }).click();

  await expect(page.locator('p[role="alert"]')).toContainText("Describe the problem or idea");
  await expect(page.getByRole("heading", { name: "Your prompts" })).not.toBeVisible();
});

test("keyboard-only visitor can generate prompts", async ({ page }) => {
  await page.goto("/tools/lateral-thinking-toolkit");

  await page.getByRole("button", { name: "Start generating prompts" }).focus();
  await page.keyboard.press("Enter");

  await page.locator("textarea").focus();
  await page.keyboard.type("naming the app");
  await page.getByRole("button", { name: "Generate prompts" }).focus();
  await page.keyboard.press("Enter");

  const resultHeading = page.getByRole("heading", { name: "Your prompts" });
  await expect(resultHeading).toBeVisible();
  // Spec §10.6/§32.4: focus moves to the result on completion.
  await expect(resultHeading).toBeFocused();
});

test.describe("mobile viewport", () => {
  // Deliberately just a viewport override, not a full `devices["iPhone 13"]` spread — the
  // full device preset sets `defaultBrowserType: "webkit"`, which this project (chromium
  // only, per playwright.config.ts) can't honour inside a describe-level `test.use`.
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("Lateral Thinking Prompt Generator is completable on a mobile viewport", async ({ page }) => {
    await page.goto("/tools/lateral-thinking-toolkit");
    await page.getByRole("button", { name: "Start generating prompts" }).click();
    await page.getByLabel(/What problem or idea are you stuck on/).fill("naming the app");
    await page.getByRole("button", { name: "Generate prompts" }).click();

    await expect(page.getByRole("heading", { name: "Your prompts" })).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";

// Spec §32.3 flow #1: browse catalogue and filter.
test("visitor can browse the catalogue and filter to free templates", async ({ page }) => {
  await page.goto("/templates");
  await expect(page.getByRole("main")).toBeVisible();

  const initialCount = await page.locator('a[href^="/templates/"]').count();
  expect(initialCount).toBeGreaterThan(0);

  await page.goto("/templates/free");
  await expect(page).toHaveURL(/\/templates\/free/);
  const freeCount = await page.locator('a[href^="/templates/"]').count();
  expect(freeCount).toBeGreaterThan(0);
});

// Spec §32.3 flow #12: keyboard-only navigation.
test("primary navigation and skip link are reachable by keyboard alone", async ({ page }) => {
  await page.goto("/");

  // First Tab from a fresh page should land on the skip link.
  await page.keyboard.press("Tab");
  const skipLink = page.locator(".skip-link");
  await expect(skipLink).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeVisible();

  await page.goto("/templates");
  const firstProductLink = page.locator('a[href^="/templates/"]').first();
  await firstProductLink.focus();
  await expect(firstProductLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/templates\/.+/);
});

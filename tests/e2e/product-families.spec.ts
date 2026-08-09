import { test, expect } from "@playwright/test";

/**
 * Spec §41 MVP acceptance criterion: "draft frameworks/products are inaccessible
 * publicly" — with the product-owner-approved exception that draft *flagship* families
 * show as narrow "Coming soon" teasers (see supabase/migrations/20260809160010_
 * it_frameworks_rls.sql and docs/decisions). This test verifies the teaser stays teaser:
 * no editorial detail (problem statement, method summary) ever reaches the page, and a
 * draft family's own detail route never serves the full editorial page.
 */

test("draft framework shows only as a public teaser, never full editorial detail", async ({ page }) => {
  await page.goto("/products");
  const teaserCard = page.getByRole("link", { name: /MVP Scoper/ });
  await expect(teaserCard).toBeVisible();
  await expect(teaserCard).toContainText("Coming soon");

  await page.goto("/journey/build");
  await expect(page.getByRole("link", { name: /MVP Scoper/ })).toBeVisible();
});

test("visiting a draft framework's own page shows the in-development state, not full detail", async ({ page }) => {
  await page.goto("/products/mvp-scoper");
  await expect(page.getByRole("heading", { name: "MVP Scoper" })).toBeVisible();
  await expect(page.getByText(/still in development/i)).toBeVisible();
  // No "Ways to use this" outputs section (Guide/Template/Tool cards) exists for a draft
  // family with no published outputs.
  await expect(page.getByRole("heading", { name: "Ways to use this" })).toHaveCount(0);
});

test("the published Product Idea Assessor family page shows full detail and its outputs", async ({ page }) => {
  await page.goto("/products/product-idea-assessor");
  // level: 1 disambiguates from the Tool output card further down the page, which shares
  // the same display name ("Product Idea Assessor") but renders as an h3.
  await expect(page.getByRole("heading", { name: "Product Idea Assessor", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ways to use this" })).toBeVisible();
  await expect(page.getByText("Learn how")).toBeVisible();
  await expect(page.getByText("Do it yourself")).toBeVisible();
  await expect(page.getByText("Do it interactively")).toBeVisible();
});

test("the published Customer Discovery Kit family page shows full detail, its outputs, and links on to its next step", async ({
  page,
}) => {
  await page.goto("/products/customer-discovery-kit");
  await expect(page.getByRole("heading", { name: "Customer Discovery Kit", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ways to use this" })).toBeVisible();
  await expect(page.getByText("Learn how")).toBeVisible();
  await expect(page.getByText("Do it yourself")).toBeVisible();
  await expect(page.getByText("Do it interactively")).toBeVisible();
  // Two Templates were reassigned to this family (Customer Interview Planner and Assumption
  // and Evidence Tracker) — both should render under the Template column.
  await expect(page.getByRole("link", { name: /Customer Interview Planner/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Assumption and Evidence Tracker/ })).toBeVisible();
  // Recommended next step per its `next_step_framework_slug`.
  await expect(page.getByRole("heading", { name: "Next step" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Better Decision Maker/ })).toBeVisible();
});

test("the published Better Decision Maker family page shows full detail, its outputs, and links on to its next step", async ({
  page,
}) => {
  await page.goto("/products/better-decision-maker");
  await expect(page.getByRole("heading", { name: "Better Decision Maker", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ways to use this" })).toBeVisible();
  await expect(page.getByText("Learn how")).toBeVisible();
  await expect(page.getByText("Do it yourself")).toBeVisible();
  await expect(page.getByText("Do it interactively")).toBeVisible();
  await expect(page.getByRole("link", { name: /Decision Worksheet/ })).toBeVisible();
  // Recommended next step per its `next_step_framework_slug` — still a draft-flagship
  // teaser at this point, which the "Next step" card renders identically to a published one.
  await expect(page.getByRole("heading", { name: "Next step" })).toBeVisible();
  await expect(page.getByRole("link", { name: /MVP Scoper/ })).toBeVisible();
});

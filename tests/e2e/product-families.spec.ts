import { test, expect } from "@playwright/test";

/**
 * Spec §41 MVP acceptance criterion: "draft frameworks/products are inaccessible
 * publicly" — with the product-owner-approved exception that draft *flagship* families
 * show as narrow "Coming soon" teasers (see supabase/migrations/20260809160010_
 * it_frameworks_rls.sql and docs/decisions/0014). The two tests that used to live here
 * ("draft framework shows only as a public teaser" / "visiting a draft framework's own
 * page shows the in-development state") were retired in docs/decisions/0025: once First
 * Customers Planner published, all six seeded frameworks are published and none are draft
 * any more, so there's no real draft-flagship data left to point the tests at. The code
 * paths they exercised (the `it_frameworks_teasers` view, and the teaser-fallback branch in
 * `src/app/(marketing)/products/[slug]/page.tsx`) are untouched and still covered by every
 * "published family" test below reaching the same page component — they'll get direct e2e
 * coverage again the next time a framework is seeded as draft.
 */

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
  // Recommended next step per its `next_step_framework_slug`.
  await expect(page.getByRole("heading", { name: "Next step" })).toBeVisible();
  await expect(page.getByRole("link", { name: /MVP Scoper/ })).toBeVisible();
});

test("the published MVP Scoper family page shows full detail, its outputs, and links on to its next step", async ({ page }) => {
  await page.goto("/products/mvp-scoper");
  await expect(page.getByRole("heading", { name: "MVP Scoper", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ways to use this" })).toBeVisible();
  await expect(page.getByText("Learn how")).toBeVisible();
  await expect(page.getByText("Do it yourself")).toBeVisible();
  await expect(page.getByText("Do it interactively")).toBeVisible();
  // The pre-existing free MVP Scope in One Page template was reassigned to this family —
  // the separate, paid MVP Scope template (Product Definition Pack) was not.
  await expect(page.getByRole("link", { name: /MVP Scope in One Page/ })).toBeVisible();
  // Recommended next step per its `next_step_framework_slug`.
  await expect(page.getByRole("heading", { name: "Next step" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Product Naming System/ })).toBeVisible();
});

test("the published Product Naming System family page shows full detail, its outputs, and links on to its next step", async ({
  page,
}) => {
  await page.goto("/products/product-naming-system");
  await expect(page.getByRole("heading", { name: "Product Naming System", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ways to use this" })).toBeVisible();
  await expect(page.getByText("Learn how")).toBeVisible();
  await expect(page.getByText("Do it yourself")).toBeVisible();
  await expect(page.getByText("Do it interactively")).toBeVisible();
  await expect(page.getByRole("link", { name: /Name Scorecard/ })).toBeVisible();
  // Recommended next step per its `next_step_framework_slug`.
  await expect(page.getByRole("heading", { name: "Next step" })).toBeVisible();
  await expect(page.getByRole("link", { name: /First Customers Planner/ })).toBeVisible();
});

test("the published First Customers Planner family page shows full detail, its outputs, and links on to its next step", async ({
  page,
}) => {
  await page.goto("/products/first-customers-planner");
  await expect(page.getByRole("heading", { name: "First Customers Planner", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ways to use this" })).toBeVisible();
  await expect(page.getByText("Learn how")).toBeVisible();
  await expect(page.getByText("Do it yourself")).toBeVisible();
  await expect(page.getByText("Do it interactively")).toBeVisible();
  await expect(page.getByRole("link", { name: /First 10 Customers Plan/ })).toBeVisible();
  // Recommended next step per its `next_step_framework_slug`.
  await expect(page.getByRole("heading", { name: "Next step" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Product\/Market Fit Tracker/ })).toBeVisible();
});

test("the published Product/Market Fit Tracker family page shows full detail and its outputs, with no next step", async ({
  page,
}) => {
  await page.goto("/products/product-market-fit-tracker");
  await expect(page.getByRole("heading", { name: "Product/Market Fit Tracker", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ways to use this" })).toBeVisible();
  await expect(page.getByText("Learn how")).toBeVisible();
  await expect(page.getByText("Do it yourself")).toBeVisible();
  await expect(page.getByText("Do it interactively")).toBeVisible();
  await expect(page.getByRole("link", { name: /PMF Signal Tracker/ })).toBeVisible();
  // First Tier 2 family, currently the newest terminal point in the founder journey —
  // `next_step_framework_slug` is null, so no "Next step" section should render at all.
  await expect(page.getByRole("heading", { name: "Next step" })).toHaveCount(0);
});

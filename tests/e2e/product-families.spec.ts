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

test("the published Product/Market Fit Tracker family page shows full detail, its outputs, and links on to its next step", async ({
  page,
}) => {
  await page.goto("/products/product-market-fit-tracker");
  await expect(page.getByRole("heading", { name: "Product/Market Fit Tracker", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ways to use this" })).toBeVisible();
  await expect(page.getByText("Learn how")).toBeVisible();
  await expect(page.getByText("Do it yourself")).toBeVisible();
  await expect(page.getByText("Do it interactively")).toBeVisible();
  await expect(page.getByRole("link", { name: /PMF Signal Tracker/ })).toBeVisible();
  // Recommended next step per its `next_step_framework_slug`.
  await expect(page.getByRole("heading", { name: "Next step" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Pricing Your Product/ })).toBeVisible();
});

test("the published Pricing Your Product family page shows full detail and its outputs, with no next step", async ({
  page,
}) => {
  await page.goto("/products/pricing-your-product");
  await expect(page.getByRole("heading", { name: "Pricing Your Product", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ways to use this" })).toBeVisible();
  await expect(page.getByText("Learn how")).toBeVisible();
  await expect(page.getByText("Do it yourself")).toBeVisible();
  await expect(page.getByText("Do it interactively")).toBeVisible();
  await expect(page.getByRole("link", { name: /Pricing Model Comparison Worksheet/ })).toBeVisible();
  // Second Tier 2 family, currently the newest terminal point in the founder journey —
  // `next_step_framework_slug` is null, so no "Next step" section should render at all.
  await expect(page.getByRole("heading", { name: "Next step" })).toHaveCount(0);
});

test("the published Product Idea Generator family page shows full detail, its outputs, and links on to its next step", async ({
  page,
}) => {
  await page.goto("/products/product-idea-generator");
  await expect(page.getByRole("heading", { name: "Product Idea Generator", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ways to use this" })).toBeVisible();
  await expect(page.getByText("Learn how")).toBeVisible();
  await expect(page.getByText("Do it yourself")).toBeVisible();
  await expect(page.getByText("Do it interactively")).toBeVisible();
  await expect(page.getByRole("link", { name: /Idea Capture Log/ })).toBeVisible();
  // Third Tier 2 family — unlike every prior family, its `next_step_framework_slug` points at
  // the front of the existing chain (Product Idea Assessor) rather than extending its tail,
  // since the Idea journey stage precedes Validate (docs/decisions/0029).
  await expect(page.getByRole("heading", { name: "Next step" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Product Idea Assessor/ })).toBeVisible();
});

test("the published Business Model Chooser family page shows full detail, its outputs, and links on to its next step", async ({
  page,
}) => {
  await page.goto("/products/business-model-chooser");
  await expect(page.getByRole("heading", { name: "Business Model Chooser", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ways to use this" })).toBeVisible();
  await expect(page.getByText("Learn how")).toBeVisible();
  await expect(page.getByText("Do it yourself")).toBeVisible();
  await expect(page.getByText("Do it interactively")).toBeVisible();
  await expect(page.getByRole("link", { name: /Business Model Comparison Canvas/ })).toBeVisible();
  // Fourth Tier 2 family — reuses Pricing Your Product's next-step target, the same "many
  // families can point at one target" pattern Launch already uses as a shared journey stage
  // (docs/decisions/0030).
  await expect(page.getByRole("heading", { name: "Next step" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Pricing Your Product/ })).toBeVisible();
});

test("the published Decision Framework Picker family page shows full detail and its outputs, with no next step", async ({
  page,
}) => {
  await page.goto("/products/decision-framework-picker");
  await expect(page.getByRole("heading", { name: "Decision Framework Picker", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ways to use this" })).toBeVisible();
  await expect(page.getByText("Learn how")).toBeVisible();
  await expect(page.getByText("Do it yourself")).toBeVisible();
  await expect(page.getByText("Do it interactively")).toBeVisible();
  await expect(page.getByRole("link", { name: /Decision Framework Cheat Sheet/ })).toBeVisible();
  // Fifth Tier 2 family — deliberately no next-step family set. Picking a thinking framework
  // doesn't causally lead to one particular next family, unlike Business Model Chooser's link
  // to Pricing Your Product (docs/decisions/0031).
  await expect(page.getByRole("heading", { name: "Next step" })).toHaveCount(0);
});

test("the published Product Positioning Builder family page shows full detail, its outputs, and links on to its next step", async ({
  page,
}) => {
  await page.goto("/products/product-positioning-builder");
  await expect(page.getByRole("heading", { name: "Product Positioning Builder", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ways to use this" })).toBeVisible();
  await expect(page.getByText("Learn how")).toBeVisible();
  await expect(page.getByText("Do it yourself")).toBeVisible();
  await expect(page.getByText("Do it interactively")).toBeVisible();
  await expect(page.getByRole("link", { name: /Positioning One-Pager/ })).toBeVisible();
  // Sixth Tier 2 family — a second branch into Product Naming System alongside MVP Scoper,
  // since positioning naturally precedes settling on a name that matches it (docs/decisions/0032).
  await expect(page.getByRole("heading", { name: "Next step" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Product Naming System/ })).toBeVisible();
});

test("the published Customer Demand Test family page shows full detail, its outputs, and links on to its next step", async ({
  page,
}) => {
  await page.goto("/products/customer-demand-test");
  await expect(page.getByRole("heading", { name: "Customer Demand Test", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ways to use this" })).toBeVisible();
  await expect(page.getByText("Learn how")).toBeVisible();
  await expect(page.getByText("Do it yourself")).toBeVisible();
  await expect(page.getByText("Do it interactively")).toBeVisible();
  await expect(page.getByRole("link", { name: /Demand Test Experiment Planner/ })).toBeVisible();
  // Seventh Tier 2 family — a second branch into Better Decision Maker alongside Customer
  // Discovery Kit, since a real demand signal is exactly the evidence that family helps you
  // act on (docs/decisions/0033).
  await expect(page.getByRole("heading", { name: "Next step" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Better Decision Maker/ })).toBeVisible();
});

test("the published Product Prioritisation Tool family page shows full detail and its outputs, with no next step", async ({
  page,
}) => {
  await page.goto("/products/product-prioritisation-tool");
  await expect(page.getByRole("heading", { name: "Product Prioritisation Tool", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ways to use this" })).toBeVisible();
  await expect(page.getByText("Learn how")).toBeVisible();
  await expect(page.getByText("Do it yourself")).toBeVisible();
  await expect(page.getByText("Do it interactively")).toBeVisible();
  await expect(page.getByRole("link", { name: /Weighted Priority Matrix/ })).toBeVisible();
  // Eighth and final Tier 2 family — deliberately no next-step family set, the same
  // legitimately-terminal reasoning as Decision Framework Picker (docs/decisions/0031, 0034).
  await expect(page.getByRole("heading", { name: "Next step" })).toHaveCount(0);
});

test("the published Lateral Thinking Toolkit family page shows full detail, its outputs, and links on to its next step", async ({
  page,
}) => {
  await page.goto("/products/lateral-thinking-toolkit");
  await expect(page.getByRole("heading", { name: "Lateral Thinking Toolkit", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ways to use this" })).toBeVisible();
  await expect(page.getByText("Learn how")).toBeVisible();
  await expect(page.getByText("Do it yourself")).toBeVisible();
  await expect(page.getByText("Do it interactively")).toBeVisible();
  await expect(page.getByRole("link", { name: /Lateral Thinking Prompt Cards/ })).toBeVisible();
  // First Tier 3 family, started at explicit user direction. A second entry point into
  // Product Idea Assessor alongside Product Idea Generator (docs/decisions/0035).
  await expect(page.getByRole("heading", { name: "Next step" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Product Idea Assessor/ })).toBeVisible();
});

test("the published User Engagement Designer family page shows full detail and its outputs, with no next step", async ({
  page,
}) => {
  await page.goto("/products/user-engagement-designer");
  await expect(page.getByRole("heading", { name: "User Engagement Designer", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ways to use this" })).toBeVisible();
  await expect(page.getByText("Learn how")).toBeVisible();
  await expect(page.getByText("Do it yourself")).toBeVisible();
  await expect(page.getByText("Do it interactively")).toBeVisible();
  await expect(page.getByRole("link", { name: /Engagement Loop Canvas/ })).toBeVisible();
  // Second Tier 3 family, built at explicit user request — deliberately no next-step family,
  // the same "recurring diagnostic" reasoning as Product Prioritisation Tool (docs/decisions/0034, 0036).
  await expect(page.getByRole("heading", { name: "Next step" })).toHaveCount(0);
});

test("the published Story Builder family page shows full detail, its outputs, and links on to its next step", async ({
  page,
}) => {
  await page.goto("/products/story-builder");
  await expect(page.getByRole("heading", { name: "Story Builder", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ways to use this" })).toBeVisible();
  await expect(page.getByText("Learn how")).toBeVisible();
  await expect(page.getByText("Do it yourself")).toBeVisible();
  await expect(page.getByText("Do it interactively")).toBeVisible();
  await expect(page.getByRole("link", { name: /Story Spine Template/ })).toBeVisible();
  // Third Tier 3 family, built at explicit user request — a second branch into First
  // Customers Planner alongside Product Naming System (docs/decisions/0037).
  await expect(page.getByRole("heading", { name: "Next step" })).toBeVisible();
  await expect(page.getByRole("link", { name: /First Customers Planner/ })).toBeVisible();
});

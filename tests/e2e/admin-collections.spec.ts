import { test, expect } from "@playwright/test";
import { getStaffAuthConfig, STAFF_AUTH_SKIP_REASON } from "./helpers/admin-auth";

/**
 * Covers the v9 Collection admin surface (spec v9 §14.3.1, §10.11-equivalent admin editorial
 * parity, docs/decisions/0062) against the real seeded "Start a Product" collection.
 *
 * Deliberately read-only: every assertion here only reads the live-seeded collection, never
 * creates/edits/publishes/reorders. Unlike the Template editor's e2e spec (which is safe to
 * mutate because it only ever saves a draft revision, leaving published content untouched),
 * this admin UI writes directly to `it_collections`/`it_collection_frameworks` with no draft
 * state — a create/edit/reorder e2e test would either leave throwaway rows in the live project
 * or risk mutating the real "Start a Product" collection's live copy. Read-only assertions give
 * genuine end-to-end coverage of the admin list/detail rendering without either risk.
 */

const COLLECTION_NAME = "Start a Product";
const EXPECTED_STEPS = [
  { label: "Assess the idea", frameworkName: "Product Idea Assessor", slug: "product-idea-assessor" },
  { label: "Understand customers", frameworkName: "Customer Discovery Kit", slug: "customer-discovery-kit" },
  { label: "Test demand", frameworkName: "Customer Demand Test", slug: "customer-demand-test" },
  { label: "Scope the MVP", frameworkName: "MVP Scoper", slug: "mvp-scoper" },
  { label: "Find first customers", frameworkName: "First Customers Planner", slug: "first-customers-planner" },
];

test.beforeEach(() => {
  test.skip(!getStaffAuthConfig(), STAFF_AUTH_SKIP_REASON);
});

test("admin Collections list shows the seeded Start a Product collection as published/public/core with 5 members", async ({ page }) => {
  await page.goto("/admin/collections");

  const row = page.getByRole("row").filter({ has: page.getByRole("link", { name: COLLECTION_NAME } ) });
  await expect(row).toBeVisible();
  await expect(row.getByText("Yes")).toBeVisible(); // Core column
  await expect(row.getByText("5", { exact: true })).toBeVisible(); // Members column
  await expect(row.getByText("published", { exact: true })).toBeVisible();
});

test("admin Collection detail page shows all 5 members in the correct order with step labels and transition copy", async ({ page }) => {
  await page.goto("/admin/collections");
  await page.getByRole("link", { name: COLLECTION_NAME }).click();
  await expect(page).toHaveURL(/\/admin\/collections\/[^/]+$/);

  await expect(page.getByRole("heading", { name: COLLECTION_NAME, level: 1 })).toBeVisible();
  await expect(page.getByText("/start-a-product · published · public")).toBeVisible();

  // Already published in the live seed — the Publish button must reflect that, not offer to
  // republish (which would rewrite published_at for no reason).
  const publishButton = page.getByRole("button", { name: "Published" });
  await expect(publishButton).toBeVisible();
  await expect(publishButton).toBeDisabled();

  const memberItems = page.locator("li", { has: page.getByText(/^Step \d+ ·/) });
  await expect(memberItems).toHaveCount(EXPECTED_STEPS.length);

  for (const [index, step] of EXPECTED_STEPS.entries()) {
    const item = memberItems.nth(index);
    await expect(item.getByText(`Step ${index + 1} · ${step.frameworkName}`)).toBeVisible();
    await expect(item.getByText(`/${step.slug}`)).toBeVisible();
    await expect(item.getByLabel("Step label")).toHaveValue(step.label);
  }
});

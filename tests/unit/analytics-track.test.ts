import { describe, expect, it, beforeEach } from "vitest";
import { trackEvent, registerAnalyticsId, ensureDataLayer } from "@/lib/analytics/track";

beforeEach(() => {
  delete window.dataLayer;
  registerAnalyticsId("G-TEST");
});

describe("trackEvent (spec v9 §25.2/§25.3)", () => {
  it("lazily creates dataLayer (with js/config queued first) and pushes the event", () => {
    trackEvent("view_framework", { framework_slug: "product-idea-assessor" });
    expect(window.dataLayer?.[1]).toEqual(["config", "G-TEST"]);
    expect(window.dataLayer).toContainEqual(["event", "view_framework", { framework_slug: "product-idea-assessor" }]);
  });

  it("pushes an empty object when no properties are given", () => {
    trackEvent("view_home");
    expect(window.dataLayer).toContainEqual(["event", "view_home", {}]);
  });

  it("ensureDataLayer is idempotent — a second call doesn't re-queue js/config", () => {
    expect(ensureDataLayer()).toBe(true);
    expect(ensureDataLayer()).toBe(true);
    expect(window.dataLayer).toEqual([["js", expect.any(Date)], ["config", "G-TEST"]]);
  });
});

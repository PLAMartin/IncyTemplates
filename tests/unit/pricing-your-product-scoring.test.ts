import { describe, expect, it } from "vitest";
import { scorePricingYourProduct } from "@/lib/tools/pricing-your-product/scoring";
import type { PricingYourProductInput } from "@/lib/tools/pricing-your-product/schema";

describe("scorePricingYourProduct — each candidate model has a reachable winning case", () => {
  it("recommends usage-based pricing when the metric is clear and the buyer is individual/hard-to-compare", () => {
    const input: PricingYourProductInput = {
      valueMetric: "clear",
      purchasePattern: "ongoing",
      customerType: "individual",
      priceVisibility: "not_visible",
    };
    const result = scorePricingYourProduct(input);
    expect(result.recommendedModel).toBe("usage_based");
    expect(result.runnerUpModel).toBe("tiered_subscription");
    expect(result.decidingFactor).toBe("how clearly value scales with a countable unit");
    expect(result.oneOffGateApplied).toBe(false);
  });

  it("recommends a tiered subscription for an enterprise buyer with opaque, incomparable pricing", () => {
    const input: PricingYourProductInput = {
      valueMetric: "somewhat",
      purchasePattern: "ongoing",
      customerType: "enterprise",
      priceVisibility: "not_visible",
    };
    const result = scorePricingYourProduct(input);
    expect(result.recommendedModel).toBe("tiered_subscription");
    expect(result.runnerUpModel).toBe("flat_subscription"); // ties usage_based, wins on fixed MODEL_ORDER
    expect(result.decidingFactor).toBe("the type of customer you're selling to");
    expect(result.oneOffGateApplied).toBe(false);
  });

  it("recommends a flat subscription for a small business with no clean value metric and visible competitor pricing", () => {
    const input: PricingYourProductInput = {
      valueMetric: "none",
      purchasePattern: "ongoing",
      customerType: "small_business",
      priceVisibility: "highly_visible",
    };
    const result = scorePricingYourProduct(input);
    expect(result.recommendedModel).toBe("flat_subscription");
    expect(result.runnerUpModel).toBe("one_time");
    expect(result.oneOffGateApplied).toBe(false);
  });
});

describe("scorePricingYourProduct — the one-off gate", () => {
  it("forces one-time pricing for a one-off job even when every other answer favours a subscription model", () => {
    const input: PricingYourProductInput = {
      valueMetric: "clear",
      purchasePattern: "one_off",
      customerType: "enterprise",
      priceVisibility: "not_visible",
    };
    // Without the gate, tiered_subscription would score highest (valueMetric 1 + customerType 3
    // + priceVisibility 2 = 6, vs usage_based's 4 and one_time's 3) — the gate overrides that.
    const result = scorePricingYourProduct(input);
    expect(result.recommendedModel).toBe("one_time");
    expect(result.oneOffGateApplied).toBe(true);
    expect(result.runnerUpModel).toBeNull();
    expect(result.decidingFactor).toBeNull();
  });

  it("does not apply the gate for ongoing use", () => {
    const result = scorePricingYourProduct({
      valueMetric: "none",
      purchasePattern: "ongoing",
      customerType: "individual",
      priceVisibility: "highly_visible",
    });
    expect(result.oneOffGateApplied).toBe(false);
  });
});

describe("scorePricingYourProduct — determinism", () => {
  it("the same input always produces the same result", () => {
    const input: PricingYourProductInput = {
      valueMetric: "somewhat",
      purchasePattern: "ongoing",
      customerType: "small_business",
      priceVisibility: "not_visible",
    };
    const first = scorePricingYourProduct(input);
    const second = scorePricingYourProduct(input);
    expect(first).toEqual(second);
  });
});

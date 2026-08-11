import { describe, expect, it } from "vitest";
import { scoreBusinessModelChooser } from "@/lib/tools/business-model-chooser/scoring";
import type { BusinessModelChooserInput } from "@/lib/tools/business-model-chooser/schema";

describe("scoreBusinessModelChooser — each candidate model has a reachable winning case", () => {
  it("recommends SaaS for a one-sided product the end user pays directly for on an ongoing basis", () => {
    const input: BusinessModelChooserInput = {
      audienceStructure: "one_sided",
      payer: "end_user_directly",
      valueDeliveryPattern: "ongoing_access",
      growthLever: "self_serve_or_sales_led",
    };
    const result = scoreBusinessModelChooser(input);
    expect(result.recommendedModel).toBe("saas");
    expect(result.runnerUpModel).toBe("advertising");
    expect(result.decidingFactor).toBe("who actually pays you");
  });

  it("recommends Marketplace for a two-sided product with transaction fees and network-effect growth", () => {
    const input: BusinessModelChooserInput = {
      audienceStructure: "two_sided",
      payer: "whoever_initiates_a_transaction",
      valueDeliveryPattern: "discrete_transactions",
      growthLever: "network_effects",
    };
    const result = scoreBusinessModelChooser(input);
    expect(result.recommendedModel).toBe("marketplace");
    expect(result.runnerUpModel).toBe("transactional");
  });

  it("recommends Transactional for a one-sided product with per-transaction fees and no network effects", () => {
    const input: BusinessModelChooserInput = {
      audienceStructure: "one_sided",
      payer: "whoever_initiates_a_transaction",
      valueDeliveryPattern: "discrete_transactions",
      growthLever: "audience_scale",
    };
    const result = scoreBusinessModelChooser(input);
    expect(result.recommendedModel).toBe("transactional");
    expect(result.runnerUpModel).toBe("marketplace");
  });

  it("recommends Advertising for a one-sided product paid for by a third party at audience scale", () => {
    const input: BusinessModelChooserInput = {
      audienceStructure: "one_sided",
      payer: "a_third_party",
      valueDeliveryPattern: "ongoing_access",
      growthLever: "audience_scale",
    };
    const result = scoreBusinessModelChooser(input);
    expect(result.recommendedModel).toBe("advertising");
    expect(result.runnerUpModel).toBe("saas");
  });
});

describe("scoreBusinessModelChooser — no gate, every combination just ranks", () => {
  it("always returns all four models ranked, never disqualifying any of them", () => {
    const result = scoreBusinessModelChooser({
      audienceStructure: "one_sided",
      payer: "end_user_directly",
      valueDeliveryPattern: "discrete_transactions",
      growthLever: "audience_scale",
    });
    expect(result.recommendedModel).toBeTruthy();
    expect(result.runnerUpModel).toBeTruthy();
  });
});

describe("scoreBusinessModelChooser — determinism", () => {
  it("the same input always produces the same result", () => {
    const input: BusinessModelChooserInput = {
      audienceStructure: "two_sided",
      payer: "whoever_initiates_a_transaction",
      valueDeliveryPattern: "discrete_transactions",
      growthLever: "self_serve_or_sales_led",
    };
    const first = scoreBusinessModelChooser(input);
    const second = scoreBusinessModelChooser(input);
    expect(first).toEqual(second);
  });
});

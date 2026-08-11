import { describe, expect, it } from "vitest";
import { scoreCustomerDemandTest } from "@/lib/tools/customer-demand-test/scoring";
import type { CustomerDemandTestInput } from "@/lib/tools/customer-demand-test/schema";

describe("scoreCustomerDemandTest — each candidate has a reachable winning case", () => {
  it("recommends the Fake Door Test when the idea is easy to explain and needs wide reach", () => {
    const input: CustomerDemandTestInput = {
      explainability: "easy_to_explain_in_words",
      manualFulfilment: "cant_fake_it_manually",
      existingPlatform: "no_need_my_own_channel",
      reachNeeded: "as_wide_as_possible",
    };
    const result = scoreCustomerDemandTest(input);
    expect(result.recommendedTest).toBe("fake_door_test");
    expect(result.runnerUpTest).toBe("youtube_mvp");
    expect(result.decidingFactor).toBe("whether your idea is easy to explain in words or needs a demo to click");
  });

  it("recommends the YouTube MVP when the idea needs a demo and needs wide reach", () => {
    const input: CustomerDemandTestInput = {
      explainability: "needs_a_demo_to_click",
      manualFulfilment: "cant_fake_it_manually",
      existingPlatform: "no_need_my_own_channel",
      reachNeeded: "as_wide_as_possible",
    };
    const result = scoreCustomerDemandTest(input);
    expect(result.recommendedTest).toBe("youtube_mvp");
    expect(result.runnerUpTest).toBe("fake_door_test");
  });

  it("recommends Wizard of Oz when it can be fulfilled manually for a handful of users", () => {
    const input: CustomerDemandTestInput = {
      explainability: "needs_a_demo_to_click",
      manualFulfilment: "could_fulfil_manually",
      existingPlatform: "no_need_my_own_channel",
      reachNeeded: "a_handful_of_real_users",
    };
    const result = scoreCustomerDemandTest(input);
    expect(result.recommendedTest).toBe("wizard_of_oz");
    expect(result.runnerUpTest).toBe("youtube_mvp");
  });

  it("recommends The Infiltrator when an existing platform fits and only a handful of users is needed", () => {
    const input: CustomerDemandTestInput = {
      explainability: "easy_to_explain_in_words",
      manualFulfilment: "cant_fake_it_manually",
      existingPlatform: "yes_fits_an_existing_platform",
      reachNeeded: "a_handful_of_real_users",
    };
    const result = scoreCustomerDemandTest(input);
    expect(result.recommendedTest).toBe("the_infiltrator");
    expect(result.runnerUpTest).toBe("fake_door_test");
  });
});

describe("scoreCustomerDemandTest — no gate, every combination just ranks", () => {
  it("always returns a recommended and runner-up test, never disqualifying any candidate", () => {
    const result = scoreCustomerDemandTest({
      explainability: "easy_to_explain_in_words",
      manualFulfilment: "could_fulfil_manually",
      existingPlatform: "no_need_my_own_channel",
      reachNeeded: "a_handful_of_real_users",
    });
    expect(result.recommendedTest).toBeTruthy();
    expect(result.runnerUpTest).toBeTruthy();
  });
});

describe("scoreCustomerDemandTest — determinism", () => {
  it("the same input always produces the same result", () => {
    const input: CustomerDemandTestInput = {
      explainability: "needs_a_demo_to_click",
      manualFulfilment: "cant_fake_it_manually",
      existingPlatform: "yes_fits_an_existing_platform",
      reachNeeded: "as_wide_as_possible",
    };
    const first = scoreCustomerDemandTest(input);
    const second = scoreCustomerDemandTest(input);
    expect(first).toEqual(second);
  });
});

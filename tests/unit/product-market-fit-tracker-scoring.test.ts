import { describe, expect, it } from "vitest";
import { scoreProductMarketFitTracker } from "@/lib/tools/product-market-fit-tracker/scoring";
import type { ProductMarketFitTrackerInput } from "@/lib/tools/product-market-fit-tracker/schema";

const worstCase: ProductMarketFitTrackerInput = {
  disappointmentSignal: "low",
  retention: "low",
  organicGrowth: "low",
  referral: "low",
  payingIntent: "low",
};

const bestCase: ProductMarketFitTrackerInput = {
  disappointmentSignal: "high",
  retention: "high",
  organicGrowth: "high",
  referral: "high",
  payingIntent: "high",
};

describe("scoreProductMarketFitTracker — boundary conditions", () => {
  it("an all-worst-case input scores 0 and reads as no_fit", () => {
    const result = scoreProductMarketFitTracker(worstCase);
    expect(result.fitScore).toBe(0);
    expect(result.fit).toBe("no_fit");
  });

  it("an all-best-case input scores 100 and reads as strong_fit", () => {
    const result = scoreProductMarketFitTracker(bestCase);
    expect(result.fitScore).toBe(100);
    expect(result.fit).toBe("strong_fit");
  });
});

describe("scoreProductMarketFitTracker — the disappointment gate", () => {
  it("a low disappointment signal forces no_fit even when every other signal is high", () => {
    const result = scoreProductMarketFitTracker({
      disappointmentSignal: "low",
      retention: "high",
      organicGrowth: "high",
      referral: "high",
      payingIntent: "high",
    });

    // Raw weighted score (retention .25 + organicGrowth .15 + referral .15 + payingIntent
    // .10, all at 100) would be 65 — strong_fit territory — but the gate overrides it.
    expect(result.fitScore).toBe(65);
    expect(result.fit).toBe("no_fit");
    expect(result.disappointmentGateApplied).toBe(true);
  });

  it("a medium disappointment signal does not trigger the gate", () => {
    const result = scoreProductMarketFitTracker({
      disappointmentSignal: "medium",
      retention: "low",
      organicGrowth: "low",
      referral: "low",
      payingIntent: "low",
    });

    expect(result.disappointmentGateApplied).toBe(false);
    expect(result.fit).toBe("no_fit"); // score alone (18) is still below the early-signal threshold.
  });

  it("a high disappointment signal does not trigger the gate", () => {
    const result = scoreProductMarketFitTracker(bestCase);
    expect(result.disappointmentGateApplied).toBe(false);
  });
});

describe("scoreProductMarketFitTracker — strongest/weakest never contradict their own sub-scores", () => {
  it("identifies the single weakest dimension and derives uncertainty/next-step from it", () => {
    const result = scoreProductMarketFitTracker({
      disappointmentSignal: "high", // strongest (100)
      retention: "low", // weakest (0)
      organicGrowth: "medium",
      referral: "medium",
      payingIntent: "medium",
    });

    expect(result.fitScore).toBe(55);
    expect(result.fit).toBe("early_signal");
    expect(result.disappointmentGateApplied).toBe(false);
    expect(result.strongestFactor).toBe("Disappointment if gone");
    expect(result.weakestFactor).toBe("Retention");
    expect(result.biggestUncertainty.toLowerCase()).toContain("drift away");
    expect(result.nextStep.toLowerCase()).toContain("drop off");
  });

  it("breaks ties deterministically (same input always produces the same result)", () => {
    const input: ProductMarketFitTrackerInput = {
      disappointmentSignal: "medium",
      retention: "medium",
      organicGrowth: "medium",
      referral: "medium",
      payingIntent: "medium",
    };
    const first = scoreProductMarketFitTracker(input);
    const second = scoreProductMarketFitTracker(input);
    expect(first).toEqual(second);
  });
});

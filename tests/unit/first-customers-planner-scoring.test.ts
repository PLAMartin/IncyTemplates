import { describe, expect, it } from "vitest";
import { scoreFirstCustomersPlanner } from "@/lib/tools/first-customers-planner/scoring";
import type { ChannelType, FirstCustomersPlannerInput } from "@/lib/tools/first-customers-planner/schema";

const worstCase = (channelType: ChannelType): FirstCustomersPlannerInput => ({
  channelType,
  audiencePresence: "low",
  founderFit: "low",
  effortToStart: "high", // inverted — high effort contributes least.
  repeatability: "low",
});

const bestCase = (channelType: ChannelType): FirstCustomersPlannerInput => ({
  channelType,
  audiencePresence: "high",
  founderFit: "high",
  effortToStart: "low", // inverted — low effort contributes most.
  repeatability: "high",
});

describe("scoreFirstCustomersPlanner — boundary conditions", () => {
  it.each(["cold_outreach", "content_marketing", "communities_and_forums", "existing_network"] as const)(
    "an all-worst-case %s scores 0 and reads as weak_fit",
    (channelType) => {
      const result = scoreFirstCustomersPlanner(worstCase(channelType));
      expect(result.fitScore).toBe(0);
      expect(result.fit).toBe("weak_fit");
    },
  );

  it.each(["cold_outreach", "content_marketing", "communities_and_forums", "existing_network"] as const)(
    "an all-best-case %s scores 100 and reads as strong_fit",
    (channelType) => {
      const result = scoreFirstCustomersPlanner(bestCase(channelType));
      expect(result.fitScore).toBe(100);
      expect(result.fit).toBe("strong_fit");
    },
  );
});

describe("scoreFirstCustomersPlanner — effort is scored inverted", () => {
  it("low effort scores higher than high effort with everything else held constant", () => {
    const shared = {
      channelType: "cold_outreach" as const,
      audiencePresence: "medium" as const,
      founderFit: "medium" as const,
      repeatability: "medium" as const,
    };
    const lowEffort = scoreFirstCustomersPlanner({ ...shared, effortToStart: "low" });
    const highEffort = scoreFirstCustomersPlanner({ ...shared, effortToStart: "high" });

    // cold_outreach weights effortToStart at 0.15, so inverting low(100)->high(0) should
    // move the score by exactly 15 points either side of the medium baseline.
    expect(lowEffort.fitScore).toBe(58);
    expect(highEffort.fitScore).toBe(43);
    expect(lowEffort.fitScore - highEffort.fitScore).toBe(15);
  });
});

describe("scoreFirstCustomersPlanner — channel type changes which dimension matters most", () => {
  it("the same raw inputs score differently depending on channel type", () => {
    const sharedAnswers = {
      audiencePresence: "high" as const,
      founderFit: "low" as const,
      effortToStart: "high" as const, // contributes 0
      repeatability: "low" as const,
    };
    const coldOutreach = scoreFirstCustomersPlanner({ channelType: "cold_outreach", ...sharedAnswers });
    const communities = scoreFirstCustomersPlanner({ channelType: "communities_and_forums", ...sharedAnswers });
    const existingNetwork = scoreFirstCustomersPlanner({ channelType: "existing_network", ...sharedAnswers });

    // Only audiencePresence (100) contributes; everything else is 0, so the score equals
    // audiencePresence's weight x 100 for each channel type.
    expect(coldOutreach.fitScore).toBe(35);
    expect(communities.fitScore).toBe(40);
    expect(existingNetwork.fitScore).toBe(15);

    expect(coldOutreach.fit).toBe("worth_testing");
    expect(communities.fit).toBe("worth_testing");
    expect(existingNetwork.fit).toBe("weak_fit");
  });
});

describe("scoreFirstCustomersPlanner — strongest/weakest never contradict their own sub-scores", () => {
  it("identifies the single weakest dimension and derives uncertainty/next-step from it", () => {
    const result = scoreFirstCustomersPlanner({
      channelType: "cold_outreach",
      audiencePresence: "high", // strongest (100)
      founderFit: "low", // weakest (0)
      effortToStart: "medium",
      repeatability: "medium",
    });

    expect(result.strongestFactor).toBe("Audience presence");
    expect(result.weakestFactor).toBe("Founder fit");
    expect(result.biggestUncertainty.toLowerCase()).toContain("skill you don't have yet");
    expect(result.nextStep.toLowerCase()).toContain("build the specific skill");
  });

  it("breaks ties deterministically (same input always produces the same result)", () => {
    const input: FirstCustomersPlannerInput = {
      channelType: "content_marketing",
      audiencePresence: "medium",
      founderFit: "medium",
      effortToStart: "medium",
      repeatability: "medium",
    };
    const first = scoreFirstCustomersPlanner(input);
    const second = scoreFirstCustomersPlanner(input);
    expect(first).toEqual(second);
  });
});

describe("scoreFirstCustomersPlanner — result always reports the input channel type back", () => {
  it.each(["cold_outreach", "content_marketing", "communities_and_forums", "existing_network"] as const)(
    "echoes %s unchanged",
    (channelType) => {
      const result = scoreFirstCustomersPlanner(bestCase(channelType));
      expect(result.channelType).toBe(channelType);
    },
  );
});

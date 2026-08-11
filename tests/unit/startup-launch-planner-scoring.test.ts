import { describe, expect, it } from "vitest";
import { generateLaunchPlan } from "@/lib/tools/startup-launch-planner/scoring";
import type { StartupLaunchPlannerInput } from "@/lib/tools/startup-launch-planner/schema";

describe("generateLaunchPlan — each candidate has a reachable top-of-plan case", () => {
  it("recommends the soft launch page first when there's nothing built yet", () => {
    const input: StartupLaunchPlannerInput = {
      hasSomethingToShow: "no_just_an_idea_so_far",
      feedbackStakes: "ready_for_public_reaction",
      existingAudience: "no_starting_from_zero",
      newsworthiness: "not_particularly_newsworthy_yet",
    };
    const result = generateLaunchPlan(input);
    expect(result.plan[0]!.option).toBe("soft_launch_page");
    expect(result.plan).toHaveLength(4);
    expect(result.plan.map((s) => s.option)).toEqual(
      expect.arrayContaining(["soft_launch_page", "friends_and_family", "community_or_social", "press"]),
    );
  });

  it("recommends friends and family first when something exists and low-stakes feedback is wanted", () => {
    const result = generateLaunchPlan({
      hasSomethingToShow: "yes_a_working_version_or_page",
      feedbackStakes: "want_low_stakes_honest_feedback_first",
      existingAudience: "no_starting_from_zero",
      newsworthiness: "not_particularly_newsworthy_yet",
    });
    expect(result.plan[0]!.option).toBe("friends_and_family");
  });

  it("recommends community or social first when an audience already exists", () => {
    const result = generateLaunchPlan({
      hasSomethingToShow: "yes_a_working_version_or_page",
      feedbackStakes: "ready_for_public_reaction",
      existingAudience: "yes_i_already_have_some_following_or_community_ties",
      newsworthiness: "not_particularly_newsworthy_yet",
    });
    expect(result.plan[0]!.option).toBe("community_or_social");
  });

  it("recommends press first when there's a genuinely newsworthy story", () => {
    const result = generateLaunchPlan({
      hasSomethingToShow: "yes_a_working_version_or_page",
      feedbackStakes: "ready_for_public_reaction",
      existingAudience: "no_starting_from_zero",
      newsworthiness: "yes_genuinely_novel_or_a_good_story",
    });
    expect(result.plan[0]!.option).toBe("press");
  });
});

describe("generateLaunchPlan — plan is a full ordering, not just a top pick", () => {
  it("returns all four options with their own tips, and a rationale for the first", () => {
    const result = generateLaunchPlan({
      hasSomethingToShow: "no_just_an_idea_so_far",
      feedbackStakes: "ready_for_public_reaction",
      existingAudience: "no_starting_from_zero",
      newsworthiness: "not_particularly_newsworthy_yet",
    });
    expect(result.plan).toHaveLength(4);
    for (const step of result.plan) {
      expect(step.tip.length).toBeGreaterThan(0);
    }
    expect(result.rationale.length).toBeGreaterThan(0);
    expect(result.nextStep.length).toBeGreaterThan(0);
  });
});

describe("generateLaunchPlan — determinism", () => {
  it("the same input always produces the same result", () => {
    const input: StartupLaunchPlannerInput = {
      hasSomethingToShow: "yes_a_working_version_or_page",
      feedbackStakes: "ready_for_public_reaction",
      existingAudience: "yes_i_already_have_some_following_or_community_ties",
      newsworthiness: "not_particularly_newsworthy_yet",
    };
    expect(generateLaunchPlan(input)).toEqual(generateLaunchPlan(input));
  });
});

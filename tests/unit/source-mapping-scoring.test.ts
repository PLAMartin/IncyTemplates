import { describe, expect, it } from "vitest";
import { calculateReuseScore } from "@/lib/source-mapping/scoring";
import type { ReuseComponentScores } from "@/lib/source-mapping/schema";

function scores(overrides: Partial<ReuseComponentScores> = {}): ReuseComponentScores {
  return { problem: 0, actionability: 0, repeatability: 0, structure: 0, automation: 0, ...overrides };
}

describe("calculateReuseScore", () => {
  it("sums all five components", () => {
    expect(calculateReuseScore(scores({ problem: 2, actionability: 2, repeatability: 2, structure: 2, automation: 2 }))).toBe(
      10,
    );
  });

  it("is 0 when every component is 0", () => {
    expect(calculateReuseScore(scores())).toBe(0);
  });

  it("matches the DB's generated column formula for a mixed set of scores", () => {
    expect(calculateReuseScore(scores({ problem: 2, actionability: 1, repeatability: 0, structure: 2, automation: 1 }))).toBe(
      6,
    );
  });
});

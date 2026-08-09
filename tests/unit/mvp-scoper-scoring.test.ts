import { describe, expect, it } from "vitest";
import { scoreMvpScoper } from "@/lib/tools/mvp-scoper/scoring";
import type { MvpScoperInput } from "@/lib/tools/mvp-scoper/schema";

const baseInput = (overrides: Partial<MvpScoperInput> = {}): MvpScoperInput => ({
  necessity: "helps_but_not_essential",
  riskyQuestionRelevance: "partially_related",
  buildEffort: "medium",
  fakeability: "no",
  ...overrides,
});

describe("scoreMvpScoper — score boundary conditions", () => {
  it("the best-case feature (essential, directly answers the risky question, low effort) scores 100 and keeps", () => {
    const result = scoreMvpScoper(
      baseInput({ necessity: "essential_for_core_value", riskyQuestionRelevance: "directly_answers", buildEffort: "low" }),
    );
    expect(result.score).toBe(100);
    expect(result.classification).toBe("keep");
  });

  it("the worst-case feature (nice to have, unrelated, high effort) scores 0 and is removed", () => {
    const result = scoreMvpScoper(
      baseInput({ necessity: "nice_to_have", riskyQuestionRelevance: "unrelated", buildEffort: "high" }),
    );
    expect(result.score).toBe(0);
    expect(result.classification).toBe("remove");
  });

  it("high effort alone doesn't stop an otherwise-perfect feature from being kept, right at the threshold", () => {
    // (100 * 0.5 + 100 * 0.5) - 35 = 65, exactly the keep threshold.
    const result = scoreMvpScoper(
      baseInput({ necessity: "essential_for_core_value", riskyQuestionRelevance: "directly_answers", buildEffort: "high" }),
    );
    expect(result.score).toBe(65);
    expect(result.classification).toBe("keep");
  });

  it("a middling feature (helps but not essential, partially related, medium effort) lands exactly on the defer threshold", () => {
    // (50 * 0.5 + 50 * 0.5) - 15 = 35, exactly the defer threshold.
    const result = scoreMvpScoper(baseInput());
    expect(result.score).toBe(35);
    expect(result.classification).toBe("defer");
  });
});

describe("scoreMvpScoper — the fakeability gate downgrades rather than scores", () => {
  it("an otherwise-perfect feature is downgraded from keep to defer when it's easily fakeable", () => {
    const built = scoreMvpScoper(
      baseInput({
        necessity: "essential_for_core_value",
        riskyQuestionRelevance: "directly_answers",
        buildEffort: "low",
        fakeability: "no",
      }),
    );
    const fakeable = scoreMvpScoper(
      baseInput({
        necessity: "essential_for_core_value",
        riskyQuestionRelevance: "directly_answers",
        buildEffort: "low",
        fakeability: "yes_easily",
      }),
    );

    expect(built.classification).toBe("keep");
    expect(built.fakeableOverrideApplied).toBe(false);

    // The score itself is unaffected by fakeability — only the classification changes.
    expect(fakeable.score).toBe(built.score);
    expect(fakeable.classification).toBe("defer");
    expect(fakeable.fakeableOverrideApplied).toBe(true);
    expect(fakeable.guidance.toLowerCase()).toContain("manually");
  });

  it("a feature that was already 'remove' is not further downgraded by fakeability", () => {
    const result = scoreMvpScoper(
      baseInput({ necessity: "nice_to_have", riskyQuestionRelevance: "unrelated", buildEffort: "high", fakeability: "yes_easily" }),
    );
    expect(result.classification).toBe("remove");
    expect(result.fakeableOverrideApplied).toBe(false);
  });

  it.each(["no", "possibly"] as const)("fakeability=%s never triggers the override", (fakeability) => {
    const result = scoreMvpScoper(
      baseInput({ necessity: "essential_for_core_value", riskyQuestionRelevance: "directly_answers", buildEffort: "low", fakeability }),
    );
    expect(result.classification).toBe("keep");
    expect(result.fakeableOverrideApplied).toBe(false);
  });
});

describe("scoreMvpScoper — determinism", () => {
  it("the same input always produces the same result", () => {
    const input = baseInput({ necessity: "essential_for_core_value", fakeability: "possibly" });
    expect(scoreMvpScoper(input)).toEqual(scoreMvpScoper(input));
  });
});

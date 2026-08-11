import { describe, expect, it } from "vitest";
import { diagnoseMeetingUsefulness } from "@/lib/tools/meeting-reset/scoring";
import type { MeetingResetInput } from "@/lib/tools/meeting-reset/schema";

function input(overrides: Partial<MeetingResetInput> = {}): MeetingResetInput {
  return {
    purposeClarity: "yes_a_clear_specific_purpose",
    interactionType: "spaghetti_many_people_need_to_discuss",
    decisionNeeded: "yes_a_decision_or_alignment_is_needed",
    attendeeNecessity: "everyone_invited_is_essential",
    ...overrides,
  };
}

describe("diagnoseMeetingUsefulness — each verdict has a reachable case", () => {
  it("cancels a meeting with no clear purpose", () => {
    const result = diagnoseMeetingUsefulness(input({ purposeClarity: "vague_or_habitual" }));
    expect(result.verdict).toBe("cancel_it");
  });

  it("replaces a star interaction with no decision needed with an async update", () => {
    const result = diagnoseMeetingUsefulness(
      input({ interactionType: "star_mostly_one_way_or_one_on_one", decisionNeeded: "no_just_sharing_information" }),
    );
    expect(result.verdict).toBe("replace_with_async_update");
  });

  it("recommends cutting the attendee list when the purpose is clear but not everyone is necessary", () => {
    const result = diagnoseMeetingUsefulness(input({ attendeeNecessity: "some_attendees_dont_need_to_be_there" }));
    expect(result.verdict).toBe("cut_the_attendee_list");
  });

  it("keeps a meeting with a clear purpose, real discussion, a needed decision, and only essential attendees", () => {
    const result = diagnoseMeetingUsefulness(input());
    expect(result.verdict).toBe("keep_as_meeting");
  });
});

describe("diagnoseMeetingUsefulness — gate priority order", () => {
  it("the purpose-clarity gate wins regardless of every other answer", () => {
    const result = diagnoseMeetingUsefulness({
      purposeClarity: "vague_or_habitual",
      interactionType: "spaghetti_many_people_need_to_discuss",
      decisionNeeded: "yes_a_decision_or_alignment_is_needed",
      attendeeNecessity: "everyone_invited_is_essential",
    });
    expect(result.verdict).toBe("cancel_it");
  });

  it("a star interaction with a decision needed does not trigger the async-update verdict", () => {
    const result = diagnoseMeetingUsefulness(
      input({ interactionType: "star_mostly_one_way_or_one_on_one", decisionNeeded: "yes_a_decision_or_alignment_is_needed" }),
    );
    expect(result.verdict).not.toBe("replace_with_async_update");
  });
});

describe("diagnoseMeetingUsefulness — result includes rationale and next step", () => {
  it("returns non-empty rationale and next step for every verdict", () => {
    const result = diagnoseMeetingUsefulness(input());
    expect(result.rationale.length).toBeGreaterThan(0);
    expect(result.nextStep.length).toBeGreaterThan(0);
  });
});

describe("diagnoseMeetingUsefulness — determinism", () => {
  it("the same input always produces the same result", () => {
    const sample = input({ attendeeNecessity: "some_attendees_dont_need_to_be_there" });
    expect(diagnoseMeetingUsefulness(sample)).toEqual(diagnoseMeetingUsefulness(sample));
  });
});

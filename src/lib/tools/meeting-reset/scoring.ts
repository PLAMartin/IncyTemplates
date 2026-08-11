import type { MeetingResetInput, MeetingResetResult, MeetingVerdict } from "./schema";

/**
 * Deterministic usefulness diagnosis for the Meeting Usefulness Diagnostic (spec v4 §37). No
 * AI is involved, consistent with every prior Tool (docs/decisions/0016) — every branch below
 * is a fixed rule, so the same input always produces the same result and every path is
 * unit-testable.
 *
 * A priority-ordered gate, checked in this order:
 *   1. No clear purpose → cancel it outright ("Without a purpose there should be no meeting").
 *   2. A "star" interaction (broadcast or one-on-one) with no group decision needed → replace
 *      with an async update ("Star group interactions are best handled outside of group
 *      meetings").
 *   3. Otherwise, if some attendees aren't essential → trim the invite list.
 *   4. Otherwise → it earns its place as a meeting.
 * Each check only applies once the earlier ones have passed, the same "first matching rule
 * wins" shape as every other gated Tool.
 */

const VERDICT_RATIONALE: Record<MeetingVerdict, string> = {
  cancel_it: "There's no clear, specific purpose — and without one, the rule is blunt: there should be no meeting at all.",
  replace_with_async_update:
    "This looks like a star interaction — one person broadcasting to many, or a one-on-one — and no group decision is needed, so it's best handled outside a group meeting.",
  cut_the_attendee_list:
    "The purpose is clear and this needs real back-and-forth discussion, but not everyone on the invite is necessary to reach that outcome.",
  keep_as_meeting: "This has a clear purpose, needs genuine multi-way discussion to reach a decision, and everyone invited is necessary — it earns its place as a meeting.",
};

const VERDICT_NEXT_STEP: Record<MeetingVerdict, string> = {
  cancel_it: "Work out what you actually need before proposing this again — a decision, a piece of information, or a discussion — and only send an invite once you can state it in one sentence.",
  replace_with_async_update: "Send the update as a written message or recording instead, and reserve people's calendars for things that actually need everyone in the room together.",
  cut_the_attendee_list: "Remove anyone whose contribution isn't essential to the purpose, and follow up with them separately afterwards if they need to know the outcome.",
  keep_as_meeting: "Assign someone to lead it, state the purpose at the top of the agenda, and make sure it ends with a clear decision or next steps, not just more discussion.",
};

export function diagnoseMeetingUsefulness(input: MeetingResetInput): MeetingResetResult {
  let verdict: MeetingVerdict;

  if (input.purposeClarity === "vague_or_habitual") {
    verdict = "cancel_it";
  } else if (input.interactionType === "star_mostly_one_way_or_one_on_one" && input.decisionNeeded === "no_just_sharing_information") {
    verdict = "replace_with_async_update";
  } else if (input.attendeeNecessity === "some_attendees_dont_need_to_be_there") {
    verdict = "cut_the_attendee_list";
  } else {
    verdict = "keep_as_meeting";
  }

  return {
    verdict,
    rationale: VERDICT_RATIONALE[verdict],
    nextStep: VERDICT_NEXT_STEP[verdict],
  };
}

import { z } from "zod";

/**
 * Meeting Reset tool input/result schemas (spec v4 §37's "usefulness diagnostic"). A gated
 * decision tree, not a weighted scoring matrix — the source material (*3 steps to transform
 * your meetings*) frames its criteria as sequential yes/no checks (no purpose → no meeting;
 * a "star" interaction → handle it outside a group meeting; unnecessary attendees → trim the
 * list), not values worth weighing against each other. Closer in spirit to MVP Scoper's
 * non-additive gate (docs/decisions/0016) than to the named-candidate scoring matrix
 * (docs/decisions/0028), but implemented as a straightforward priority-ordered tree rather
 * than a weighted score with a downgrade gate, since there's no natural numeric "score" for
 * a meeting's usefulness. See docs/decisions/0039.
 */
export const purposeClaritySchema = z.enum(["yes_a_clear_specific_purpose", "vague_or_habitual"]);
export type PurposeClarity = z.infer<typeof purposeClaritySchema>;

export const interactionTypeSchema = z.enum(["spaghetti_many_people_need_to_discuss", "star_mostly_one_way_or_one_on_one"]);
export type InteractionType = z.infer<typeof interactionTypeSchema>;

export const decisionNeededSchema = z.enum(["yes_a_decision_or_alignment_is_needed", "no_just_sharing_information"]);
export type DecisionNeeded = z.infer<typeof decisionNeededSchema>;

export const attendeeNecessitySchema = z.enum(["everyone_invited_is_essential", "some_attendees_dont_need_to_be_there"]);
export type AttendeeNecessity = z.infer<typeof attendeeNecessitySchema>;

export const meetingResetInputSchema = z.object({
  purposeClarity: purposeClaritySchema,
  interactionType: interactionTypeSchema,
  decisionNeeded: decisionNeededSchema,
  attendeeNecessity: attendeeNecessitySchema,
});
export type MeetingResetInput = z.infer<typeof meetingResetInputSchema>;

export const meetingVerdictSchema = z.enum(["cancel_it", "replace_with_async_update", "cut_the_attendee_list", "keep_as_meeting"]);
export type MeetingVerdict = z.infer<typeof meetingVerdictSchema>;

export const meetingResetResultSchema = z.object({
  verdict: meetingVerdictSchema,
  rationale: z.string(),
  nextStep: z.string(),
});
export type MeetingResetResult = z.infer<typeof meetingResetResultSchema>;

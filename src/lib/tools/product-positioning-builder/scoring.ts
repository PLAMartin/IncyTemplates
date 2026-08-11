import type {
  CutThroughApproach,
  CutThroughTactic,
  ProductPositioningBuilderInput,
  ProductPositioningBuilderResult,
} from "./schema";

/**
 * Deterministic statement assembly and tactic lookup for the Positioning Statement Builder
 * (spec v4 §37). No AI is involved, consistent with every prior Tool (docs/decisions/0016):
 * the visitor's free text is only ever interpolated into a fixed template, and the tactic
 * recommendation is a direct one-to-one lookup from a single answer, not a computed score —
 * there's nothing to weigh against anything else, so a scoring matrix would just be
 * decoration. See docs/decisions/0032.
 */

const CUT_THROUGH_APPROACH_TO_TACTIC: Record<CutThroughApproach, CutThroughTactic> = {
  problem_people_actively_worry_about: "scary",
  unusual_or_unexpected_offer: "strange",
  visually_or_emotionally_striking: "sexy",
  can_give_away_something_valuable_upfront: "free_gift",
  building_repeated_content_over_time: "familiar",
};

const TACTIC_EXPLANATION: Record<CutThroughTactic, string> = {
  scary:
    "Fear is one of the most effective filters to get past — frame your marketing around the problem people are already worried about, the way the news uses fear to hold attention.",
  strange:
    "Unusual or unexpected packaging draws a second look — lean into whatever makes your product genuinely different from what people expect, the way a strange object in a familiar setting demands investigation.",
  sexy: "Visually or emotionally striking presentation triggers primal attention — invest in how your product and marketing actually look and feel, not just what they say.",
  free_gift:
    "Giving away something valuable upfront — well-packaged, not an afterthought — builds a positive first impression before you ever ask for payment.",
  familiar:
    "Trust builds through repetition — research suggests it takes around eleven positive interactions before a brand really sticks, so plan for many small touchpoints over time, not one big pitch.",
};

const NEXT_STEP = "Write this statement down somewhere visible, and test it on a handful of real prospective customers to see if it actually lands.";

function assembleStatement(input: ProductPositioningBuilderInput): string {
  const core = `When ${input.idealCustomer} ${input.desiredAction}, they get ${input.desiredOutcome}.`;
  if (!input.admiredIdentity) return core;
  return `${core} That's what lets them feel like ${input.admiredIdentity}.`;
}

export function scoreProductPositioningBuilder(input: ProductPositioningBuilderInput): ProductPositioningBuilderResult {
  const recommendedTactic = CUT_THROUGH_APPROACH_TO_TACTIC[input.cutThroughApproach];

  return {
    positioningStatement: assembleStatement(input),
    recommendedTactic,
    tacticExplanation: TACTIC_EXPLANATION[recommendedTactic],
    nextStep: NEXT_STEP,
  };
}

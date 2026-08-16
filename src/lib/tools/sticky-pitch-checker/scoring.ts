import type { FactorGroup, FactorState, StickyPitchCheckerInput, StickyPitchCheckerResult, StickyPitchFactor } from "./schema";

/**
 * Deterministic factor checking for the Sticky Pitch Checker (spec v7 §23.2). No AI is
 * involved, consistent with every prior Tool (docs/decisions/0016) — the visitor self-reports
 * each factor's state, the Tool never inspects their actual pitch text.
 *
 * Checks all ten factors in a fixed order — SUCCESs's own six (Made to Stick), then STEPPS's
 * four remaining unique ones (Contagious, with Emotion and Stories excluded — see schema.ts's
 * header comment) — and surfaces a tip for the first one not yet met, the same "fill gaps in
 * the order the framework itself is taught" precedent Story Builder (docs/decisions/0037),
 * Writing Editor (docs/decisions/0040) and App Design Review (docs/decisions/0041) all set.
 */

const FACTOR_ORDER: StickyPitchFactor[] = [
  "simple",
  "unexpected",
  "concrete",
  "credible",
  "emotional",
  "story",
  "social_currency",
  "triggers",
  "public",
  "practical_value",
];

const FACTOR_GROUP: Record<StickyPitchFactor, FactorGroup> = {
  simple: "stick",
  unexpected: "stick",
  concrete: "stick",
  credible: "stick",
  emotional: "stick",
  story: "stick",
  social_currency: "spread",
  triggers: "spread",
  public: "spread",
  practical_value: "spread",
};

const FACTOR_INPUT_KEY: Record<StickyPitchFactor, keyof StickyPitchCheckerInput> = {
  simple: "simple",
  unexpected: "unexpected",
  concrete: "concrete",
  credible: "credible",
  emotional: "emotional",
  story: "story",
  social_currency: "socialCurrency",
  triggers: "triggers",
  public: "public",
  practical_value: "practicalValue",
};

const FACTOR_LABEL: Record<StickyPitchFactor, string> = {
  simple: "Simple",
  unexpected: "Unexpected",
  concrete: "Concrete",
  credible: "Credible",
  emotional: "Emotional",
  story: "Story",
  social_currency: "Social Currency",
  triggers: "Triggers",
  public: "Public",
  practical_value: "Practical Value",
};

const FACTOR_TIP: Record<StickyPitchFactor, string> = {
  simple:
    "Simple: boil the pitch down to one core, profound sentence. If you're making several points at once, none of them will be remembered — aim for something like JFK's \"put a man on the moon,\" simple without being simplistic.",
  unexpected:
    "Unexpected: break the pattern people expect. Surprise gets attention; opening a genuine gap in someone's knowledge (a hook) is what keeps it, the same way a good mystery story does.",
  concrete:
    "Concrete: speak in terms of human actions and the five senses, not generic mission-statement language. Concrete imagery means your idea means the same thing to everyone who hears it.",
  credible:
    "Credible: back the idea with specific, internally consistent detail or a real test case, rather than leaning on your own authority — demonstrate rather than tell.",
  emotional:
    "Emotional: make people feel something, not just understand it. Appeal to identity, or to something they already care about, and describe benefits rather than features.",
  story:
    "Story: wrap the idea in a story people can mentally rehearse. A story someone can picture themselves acting out is what actually gets retold.",
  social_currency:
    "Social Currency: give people a way to look clever, cool or in-the-know for sharing it. Remarkable, novel or slightly exclusive ideas are the ones people talk about.",
  triggers:
    "Triggers: tie the idea to something already in your audience's everyday environment, so it comes to mind at the moment it's actually useful — not just the one time they first heard it.",
  public: "Public: make the idea's use visible to others. The more observable it is, the more it triggers someone else to try it too.",
  practical_value:
    "Practical Value: package the value so it's easy to pass on. A specific, quantified detail — a percentage, a stat — travels further than a vague claim.",
};

const ALL_MET_TIP = "All ten factors are already there. Revisit this the next time you're pitching something new, not just once.";

const CLOSING_NOTE =
  "The first six factors (Simple, Unexpected, Concrete, Credible, Emotional, Story) make an idea memorable — Chip and Dan Heath's SUCCESs framework. The last four (Social Currency, Triggers, Public, Practical Value) make it spread once people have heard it — Jonah Berger's STEPPS framework.";

const NEXT_STEP = "Download the Sticky Pitch Worksheet and run your next pitch through it before you use it on a real customer or investor.";

function buildFactorStates(input: StickyPitchCheckerInput): FactorState[] {
  return FACTOR_ORDER.map((factor) => ({
    factor,
    group: FACTOR_GROUP[factor],
    label: FACTOR_LABEL[factor],
    present: input[FACTOR_INPUT_KEY[factor]] === "already_there",
  }));
}

export function checkStickyPitch(input: StickyPitchCheckerInput): StickyPitchCheckerResult {
  const factorStates = buildFactorStates(input);
  const firstMissing = factorStates.find((state) => !state.present);

  return {
    factorStates,
    stickCount: factorStates.filter((state) => state.group === "stick" && state.present).length,
    spreadCount: factorStates.filter((state) => state.group === "spread" && state.present).length,
    firstTip: firstMissing ? FACTOR_TIP[firstMissing.factor] : ALL_MET_TIP,
    closingNote: CLOSING_NOTE,
    nextStep: NEXT_STEP,
  };
}

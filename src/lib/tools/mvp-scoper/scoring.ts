import type { BuildEffort, Classification, Fakeability, MvpScoperInput, MvpScoperResult, Necessity, RiskyQuestionRelevance } from "./schema";

/**
 * Deterministic scoring for the MVP Scoper Scope Decider (spec v3 §37). No AI is involved,
 * mirroring [[0016-product-idea-assessor-tool-deterministic-only]] — every number here comes
 * from a fixed lookup table or a formula, so the same input always produces the same result
 * and every branch is unit-testable.
 *
 * The score itself (necessity + risky-question relevance, minus an effort penalty) only
 * gets you to a first-pass keep/defer/remove classification. `fakeability` then acts as a
 * *downgrade gate*, not one more weighted input: an item that could be delivered manually —
 * a concierge process, a spreadsheet — gets downgraded from keep or defer-on-the-fence to
 * defer specifically so it's tested by hand before any engineering effort goes into it. This
 * mirrors the shape of each earlier Tool having its own non-additive rule (Customer
 * Discovery Kit's bias cap, Better Decision Maker's reversibility tiebreak) rather than
 * reusing any of their mechanics.
 */

const NECESSITY_SCORE: Record<Necessity, number> = {
  nice_to_have: 10,
  helps_but_not_essential: 50,
  essential_for_core_value: 100,
};

const RELEVANCE_SCORE: Record<RiskyQuestionRelevance, number> = {
  unrelated: 10,
  partially_related: 50,
  directly_answers: 100,
};

const EFFORT_PENALTY: Record<BuildEffort, number> = { low: 0, medium: 15, high: 35 };

const KEEP_THRESHOLD = 65;
const DEFER_THRESHOLD = 35;

const GUIDANCE: Record<Classification, string> = {
  keep: "This clearly earns a place in the MVP — it's necessary and directly relevant to your riskiest open question, worth the effort to build now.",
  defer:
    "This helps but isn't essential yet, or doesn't directly address your riskiest question — worth planning for, not worth building in this first pass.",
  remove: "This doesn't earn its place in the MVP scope — cut it and revisit later if real usage shows you were wrong.",
};

const FAKEABLE_OVERRIDE_GUIDANCE =
  "This scores well, but you could deliver it manually — a concierge process, a spreadsheet, a one-off email — without writing any code at all. Do that first.";

const NEXT_STEP: Record<Classification, string> = {
  keep: "Add it to your MVP Scope in One Page under 'in scope' and build it in this first pass.",
  defer: "Note it as explicitly out of scope for now — the MVP Scope in One Page has a place for exactly this.",
  remove: "Leave it out entirely — don't even list it as deferred unless new evidence changes the picture.",
};

const FAKEABLE_OVERRIDE_NEXT_STEP =
  "Find the manual way to deliver this without building it, and only revisit building it once the manual version becomes the actual bottleneck.";

function rawScore(input: MvpScoperInput): number {
  const base = NECESSITY_SCORE[input.necessity] * 0.5 + RELEVANCE_SCORE[input.riskyQuestionRelevance] * 0.5;
  const penalised = base - EFFORT_PENALTY[input.buildEffort];
  return Math.max(0, Math.min(100, Math.round(penalised)));
}

function classify(score: number): Classification {
  if (score >= KEEP_THRESHOLD) return "keep";
  if (score >= DEFER_THRESHOLD) return "defer";
  return "remove";
}

function applyFakeabilityGate(
  classification: Classification,
  fakeability: Fakeability,
): { classification: Classification; overrideApplied: boolean } {
  if (fakeability === "yes_easily" && classification !== "remove") {
    return { classification: "defer", overrideApplied: true };
  }
  return { classification, overrideApplied: false };
}

export function scoreMvpScoper(input: MvpScoperInput): MvpScoperResult {
  const score = rawScore(input);
  const firstPass = classify(score);
  const { classification, overrideApplied } = applyFakeabilityGate(firstPass, input.fakeability);

  return {
    score,
    classification,
    fakeableOverrideApplied: overrideApplied,
    guidance: overrideApplied ? FAKEABLE_OVERRIDE_GUIDANCE : GUIDANCE[classification],
    nextStep: overrideApplied ? FAKEABLE_OVERRIDE_NEXT_STEP : NEXT_STEP[classification],
  };
}

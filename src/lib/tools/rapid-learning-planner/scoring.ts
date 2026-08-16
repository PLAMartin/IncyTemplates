import type {
  RapidLearningPlannerInput,
  RapidLearningPlannerResult,
  RapidLearningStep,
  RapidLearningStepState,
} from "./schema";

/**
 * Deterministic plan checking for the Rapid Learning Plan Check (spec v7 §23.2). No AI is
 * involved, consistent with every prior Tool (docs/decisions/0016) — the visitor's own text is
 * only ever echoed back and checked for presence, never interpreted or rewritten by any model.
 *
 * Checks all four DSSS steps against the visitor's own text, in Tim Ferriss's own taught
 * order, and surfaces a tip for the first missing one — filling gaps in the order the
 * framework itself is taught, the same precedent Story Builder (docs/decisions/0037) and
 * Negotiation Prep (docs/decisions/0055) both set.
 */

const STEP_ORDER: RapidLearningStep[] = ["deconstruction", "selection", "sequencing", "stakes"];

const STEP_LABEL: Record<RapidLearningStep, string> = {
  deconstruction: "Deconstruction",
  selection: "Selection",
  sequencing: "Sequencing",
  stakes: "Stakes",
};

const STEP_TIP: Record<RapidLearningStep, string> = {
  deconstruction:
    "Break the skill into its smaller, independent parts before you do anything else. Swimming isn't one skill — it's floating, breathing, gliding, kicking, rhythm and confidence underwater. A vague goal like \"learn Japanese\" resists action; a deconstructed one doesn't.",
  selection:
    "Pick the 20% that gets you 80% of the value, and attack that first. Conversational fluency in a language depends disproportionately on its most common ~1,500 words — research and preparation can quietly become procrastination, so select the few highest-leverage pieces rather than trying to master everything.",
  sequencing:
    "Learn things in the right order, not just the right things. Beginners obsess over breathing before they can glide; founders try to scale before product-market fit. Good sequencing builds momentum, and momentum is what makes consistency easier.",
  stakes:
    "Information alone rarely changes behaviour. Build in real accountability — a public commitment, a deadline, a consequence — strong enough to make progress the easier option than avoiding it.",
};

const ALL_PREPARED_TIP = "All four steps are planned. Revisit this the next time you pick up a new skill, not just once.";

const NEXT_STEP = "Download the Rapid Learning Plan and start applying it to the actual skill you're learning this week.";

function summarisePlan(steps: RapidLearningStepState[]): string {
  return steps
    .filter((s) => s.present)
    .map((s) => `${STEP_LABEL[s.step]}: ${s.text}`)
    .join("\n");
}

export function checkRapidLearningPlan(input: RapidLearningPlannerInput): RapidLearningPlannerResult {
  const steps: RapidLearningStepState[] = STEP_ORDER.map((step) => {
    const text = input[step].trim();
    return { step, text, present: text.length > 0 };
  });

  const firstMissing = steps.find((s) => !s.present);

  return {
    steps,
    planSummary: summarisePlan(steps),
    nextTip: firstMissing ? STEP_TIP[firstMissing.step] : ALL_PREPARED_TIP,
    nextStep: NEXT_STEP,
  };
}

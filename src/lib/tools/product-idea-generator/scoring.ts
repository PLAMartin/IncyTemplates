import type {
  DailyPracticeCommitment,
  IdeaCandidate,
  IdeaMethod,
  ProductIdeaGeneratorInput,
  ProductIdeaGeneratorResult,
} from "./schema";

/**
 * Deterministic idea-direction generation for the Product Idea Generator Tool (spec v4 §37).
 * No AI is involved, consistent with every prior Tool (docs/decisions/0016): the visitor's own
 * text is only ever interpolated into a fixed template string per method, never sent anywhere
 * or interpreted by a model, so the same input always produces the same result.
 *
 * Each of the three source methods from `How I generate app ideas` maps to one optional
 * free-text field. A candidate idea direction is produced for every field the visitor filled
 * in; the "recommended" one is whichever input is richest, using trimmed word count as a
 * simple, deterministic, testable proxy for "most worth starting from" — the same
 * fixed-lookup-table spirit as every other Tool's scoring, applied to free text instead of
 * multiple-choice answers. Ties resolve via `METHOD_ORDER`, the same fixed-iteration-order
 * tie-break shape used by every scored Tool since Pricing Your Product (docs/decisions/0028).
 */

// Fixed order so candidate output and richness ties resolve deterministically (first wins).
const METHOD_ORDER: IdeaMethod[] = ["scratch_your_own_itch", "address_a_niche", "improve_existing"];

const METHOD_FIELD: Record<IdeaMethod, keyof Pick<ProductIdeaGeneratorInput, "ownFrustration" | "nicheKnowledge" | "frequentlyUsedProduct">> = {
  scratch_your_own_itch: "ownFrustration",
  address_a_niche: "nicheKnowledge",
  improve_existing: "frequentlyUsedProduct",
};

const PROMPT_TEMPLATE: Record<IdeaMethod, (text: string) => string> = {
  scratch_your_own_itch: (text) =>
    `You mentioned this frustrates you: "${text}." Chances are you're not the only one — sketch out who else probably runs into the same problem.`,
  address_a_niche: (text) =>
    `You know this world from the inside: "${text}." What's the one thing people there wish existed but don't have yet?`,
  improve_existing: (text) =>
    `You already use and rely on: "${text}." What's the one thing about it that still doesn't quite work — and what would fixing it actually take?`,
};

const TEST_STEP_TEMPLATE: Record<IdeaMethod, string> = {
  scratch_your_own_itch: "Ask three other people whether they run into the same problem, before assuming it's universal.",
  address_a_niche: "Describe the idea to someone actually inside that niche and watch whether they lean in or shrug.",
  improve_existing: "Write down exactly what the existing product gets wrong, in one sentence, then check whether anyone else has said the same thing publicly.",
};

const DAILY_PRACTICE_NUDGE: Record<DailyPracticeCommitment, string> = {
  not_yet:
    "Start small: write down even one idea a day for a week. The goal right now is building the habit, not judging the ideas.",
  willing_to_try: "Try it for the next seven days: one dated line per idea, no judging as you go — review them at the end of the week.",
  already_do_it: "Keep going — revisit your list weekly and pull out whichever ideas still feel interesting a few days later.",
};

const NEXT_STEP =
  "Once one of these feels real, take it to Product Idea Assessor to work out how much evidence it needs before you commit real time to it.";

function richness(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function scoreProductIdeaGenerator(input: ProductIdeaGeneratorInput): ProductIdeaGeneratorResult {
  const candidates: IdeaCandidate[] = METHOD_ORDER.filter((method) => richness(input[METHOD_FIELD[method]]) > 0).map((method) => {
    const text = input[METHOD_FIELD[method]].trim();
    return {
      method,
      promptText: PROMPT_TEMPLATE[method](text),
      testStep: TEST_STEP_TEMPLATE[method],
    };
  });

  const recommendedMethod = candidates.reduce((best, candidate) => {
    const bestRichness = richness(input[METHOD_FIELD[best.method]]);
    const candidateRichness = richness(input[METHOD_FIELD[candidate.method]]);
    return candidateRichness > bestRichness ? candidate : best;
  }, candidates[0]!).method;

  return {
    candidates,
    recommendedMethod,
    dailyPracticeNudge: DAILY_PRACTICE_NUDGE[input.dailyPracticeCommitment],
    nextStep: NEXT_STEP,
  };
}

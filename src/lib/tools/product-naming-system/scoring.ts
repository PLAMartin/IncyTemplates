import type { Availability, ProductNamingSystemInput, ProductNamingSystemResult, Rating, Recommendation } from "./schema";

/**
 * Deterministic scoring for the Product Naming System Name Comparator (spec v3 §37). No AI
 * is involved, mirroring [[0016-product-idea-assessor-tool-deterministic-only]] — every
 * number here comes from a fixed lookup table or a formula, so the same input always
 * produces the same result and every branch is unit-testable.
 *
 * Each name's score is a plain average of memorability, clarity and distinctiveness — a
 * different formula from every earlier Tool's weighted sum. `availability` is checked
 * separately as a hard gate: a name that's taken everywhere is disqualified outright, not
 * merely docked points, because no amount of memorability makes an unusable name usable.
 */

const RATING_SCORE: Record<Rating, number> = { low: 20, medium: 60, high: 100 };

// Below this point-gap between two usable names, treat them as statistically
// indistinguishable rather than picking a "winner" on numbers this close.
const CLOSE_CALL_THRESHOLD = 10;

function isUsable(availability: Availability): boolean {
  return availability !== "taken_everywhere";
}

function score(memorability: Rating, clarity: Rating, distinctiveness: Rating): number {
  const total = RATING_SCORE[memorability] + RATING_SCORE[clarity] + RATING_SCORE[distinctiveness];
  return Math.round(total / 3);
}

function recommendationFor(usableA: boolean, usableB: boolean, scoreA: number, scoreB: number): Recommendation {
  if (!usableA && !usableB) return "neither_usable";
  if (!usableA) return "name_b";
  if (!usableB) return "name_a";
  if (Math.abs(scoreA - scoreB) < CLOSE_CALL_THRESHOLD) return "too_close_to_call";
  return scoreA > scoreB ? "name_a" : "name_b";
}

function guidanceFor(
  recommendation: Recommendation,
  scoreA: number,
  scoreB: number,
  usableA: boolean,
  usableB: boolean,
): string {
  if (recommendation === "neither_usable") {
    return "Neither name is available to use as-is — go back to name generation rather than trying to force either of these through.";
  }
  if (recommendation === "too_close_to_call") {
    return `Name A (${scoreA}) and Name B (${scoreB}) are close enough that the numbers alone shouldn't decide this.`;
  }
  if (recommendation === "name_a") {
    return usableB
      ? `Name A scores higher (${scoreA} vs ${scoreB}) and both names are available to use.`
      : "Name B isn't usable (taken everywhere), so Name A wins by default — its own availability still needs a proper check.";
  }
  return usableA
    ? `Name B scores higher (${scoreB} vs ${scoreA}) and both names are available to use.`
    : "Name A isn't usable (taken everywhere), so Name B wins by default — its own availability still needs a proper check.";
}

function nextStepFor(recommendation: Recommendation, usableA: boolean, usableB: boolean): string {
  if (recommendation === "neither_usable") {
    return "Generate more candidate names and run this comparison again before getting attached to either of these.";
  }
  if (recommendation === "too_close_to_call") {
    return "Test both names with a handful of real people and see which one people repeat back correctly.";
  }
  const opponentDisqualified = recommendation === "name_a" ? !usableB : !usableA;
  return opponentDisqualified
    ? "Run a proper trademark and domain search on the surviving name — 'not taken everywhere' isn't the same as fully cleared."
    : "Run a proper trademark and domain search on the winning name before treating it as final.";
}

export function scoreProductNamingSystem(input: ProductNamingSystemInput): ProductNamingSystemResult {
  const nameAScore = score(input.nameAMemorability, input.nameAClarity, input.nameADistinctiveness);
  const nameBScore = score(input.nameBMemorability, input.nameBClarity, input.nameBDistinctiveness);
  const nameAUsable = isUsable(input.nameAAvailability);
  const nameBUsable = isUsable(input.nameBAvailability);

  const recommendation = recommendationFor(nameAUsable, nameBUsable, nameAScore, nameBScore);

  return {
    nameAScore,
    nameBScore,
    nameAUsable,
    nameBUsable,
    recommendation,
    guidance: guidanceFor(recommendation, nameAScore, nameBScore, nameAUsable, nameBUsable),
    nextStep: nextStepFor(recommendation, nameAUsable, nameBUsable),
  };
}

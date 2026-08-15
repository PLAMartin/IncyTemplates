import type { ReuseComponentScores, SourceUseType } from "./schema";
import { calculateReuseScore } from "./scoring";

/**
 * Suggests IncyTemplates use(s) from a post's five component scores, per spec v7 §23.2.2's
 * band table:
 *
 *   0-4  -> source_only (may still support another framework as example/evidence/background)
 *   5-6  -> template (often accompanied by a Guide when explanation is valuable)
 *   7-8  -> template, +tool only if Structure/Automation are strong enough to justify it
 *   9-10 -> tool, +template only when Structure is a full 2 (structure=0 can't reach 9-10 at
 *          all given five 0-2 components summing to the total, and structure=1 alone doesn't
 *          say the post also stands alone as a reusable structure the way a full score does)
 *
 * "Tool requires enough Structure/Automation value to justify implementation" (spec) isn't a
 * fixed number, so `structure + automation >= 3` is this codebase's deterministic reading of
 * it (i.e. not both merely "some benefit" — at least one of the two is a full 2, or both are
 * scoring above the minimum). Reviewed and overridable by an Editor either way, since every
 * suggestion here is advisory (spec §23.2.3).
 */
function suggestUsesFromScore(scores: ReuseComponentScores): SourceUseType[] {
  const total = calculateReuseScore(scores);

  if (total <= 4) return ["source_only"];
  if (total <= 6) return ["template"];
  if (total <= 8) {
    return scores.structure + scores.automation >= 3 ? ["template", "tool"] : ["template"];
  }
  return scores.structure === 2 ? ["tool", "template"] : ["tool"];
}

/**
 * Guide is explicitly **not** threshold-driven (spec v7 §23.2.2: "suggest guide whenever a
 * post contains a reusable principle/method... including posts whose score is below the
 * Template/Tool thresholds"). Callers pass `hasTeachableMethod` — true when the post has an
 * extracted principle/method worth explaining — as an independent signal from the score bands
 * above, not derived from them.
 */
export function suggestUses(scores: ReuseComponentScores, hasTeachableMethod: boolean): SourceUseType[] {
  const uses = suggestUsesFromScore(scores);
  if (hasTeachableMethod && !uses.includes("guide")) {
    return [...uses, "guide"];
  }
  return uses;
}

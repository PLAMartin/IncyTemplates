import type { ReuseComponentScores } from "./schema";

/**
 * Deterministic 0-10 reuse score: a plain sum of the five 0-2 component scores (spec v7
 * §23.2.2), matching `it_source_post_use_assessments.reuse_score`'s Postgres `generated
 * always as` column exactly (20260815140005_it_source_mapping_schema.sql) so application code
 * and the database never disagree. Spec §12.8: "the reuse score is deterministic from stored
 * component scores... application code validates 0-2 values and recalculates the total rather
 * than trusting an LLM-supplied total" — this is that recalculation.
 */
export function calculateReuseScore(scores: ReuseComponentScores): number {
  return scores.problem + scores.actionability + scores.repeatability + scores.structure + scores.automation;
}

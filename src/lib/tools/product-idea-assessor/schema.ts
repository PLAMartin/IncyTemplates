import { z } from "zod";

/**
 * Product Idea Assessor input/result schemas (spec v3 §39.3: deterministic dimensions are
 * Copy/Improve/Differentiate classification + evidence quality). `classification` is the
 * user's own read of the three categories explained in the paired Guide
 * (content/guides/product-idea-assessor.mdx, formerly /methods/proven-better-new); the other
 * four answers feed the deterministic evidence-quality score in `scoring.ts`.
 */
export const classificationSchema = z.enum(["copy", "improve", "differentiate"]);
export type Classification = z.infer<typeof classificationSchema>;

export const behaviourEvidenceSchema = z.enum(["none", "anecdotal", "observed", "committed"]);
export type BehaviourEvidence = z.infer<typeof behaviourEvidenceSchema>;

export const problemEvidenceSchema = z.enum(["assumed", "some_conversations", "validated"]);
export type ProblemEvidence = z.infer<typeof problemEvidenceSchema>;

export const differentiationClaritySchema = z.enum(["unclear", "some", "clear"]);
export type DifferentiationClarity = z.infer<typeof differentiationClaritySchema>;

export const targetSpecificitySchema = z.enum(["broad", "somewhat_specific", "specific"]);
export type TargetSpecificity = z.infer<typeof targetSpecificitySchema>;

export const productIdeaAssessorInputSchema = z.object({
  classification: classificationSchema,
  behaviourEvidence: behaviourEvidenceSchema,
  problemEvidence: problemEvidenceSchema,
  differentiationClarity: differentiationClaritySchema,
  targetSpecificity: targetSpecificitySchema,
});
export type ProductIdeaAssessorInput = z.infer<typeof productIdeaAssessorInputSchema>;

export const overallReadinessSchema = z.enum(["ready_to_proceed", "gather_more_evidence", "high_risk_pause"]);
export type OverallReadiness = z.infer<typeof overallReadinessSchema>;

export const productIdeaAssessorResultSchema = z.object({
  classification: classificationSchema,
  evidenceQualityScore: z.number().min(0).max(100),
  overallReadiness: overallReadinessSchema,
  strongestArea: z.string(),
  weakestArea: z.string(),
  biggestUncertainty: z.string(),
  nextEvidenceAction: z.string(),
});
export type ProductIdeaAssessorResult = z.infer<typeof productIdeaAssessorResultSchema>;

import { z } from "zod";

/**
 * Customer Discovery Kit Evidence Analyser input/result schemas (spec v3 §37's "evidence
 * analyser" output). Scores a round of customer interviews the user has already run —
 * distinct from the Product Idea Assessor, which scores evidence about an idea in the
 * abstract before any interviews happen. The five dimensions mirror the technique taught in
 * content/guides/customer-discovery-kit.mdx and
 * content/guides/run-a-customer-interview-that-changes-your-mind.mdx: how many people, how
 * leading the questions were, whether the evidence was real past behaviour or just opinion,
 * whether anyone showed a costly commitment, and whether a pattern is actually forming.
 */
export const interviewCountSchema = z.enum(["fewer_than_3", "three_to_five", "six_to_ten", "more_than_ten"]);
export type InterviewCount = z.infer<typeof interviewCountSchema>;

export const questionStyleSchema = z.enum(["mostly_leading", "mixed", "mostly_open"]);
export type QuestionStyle = z.infer<typeof questionStyleSchema>;

export const evidenceTypeSchema = z.enum(["opinions_only", "some_past_behaviour", "consistent_past_behaviour"]);
export type EvidenceType = z.infer<typeof evidenceTypeSchema>;

export const commitmentSignalSchema = z.enum(["no_commitment", "workaround_or_effort", "money_or_switching_cost"]);
export type CommitmentSignal = z.infer<typeof commitmentSignalSchema>;

export const patternConsistencySchema = z.enum(["no_pattern", "partial_pattern", "strong_pattern"]);
export type PatternConsistency = z.infer<typeof patternConsistencySchema>;

export const customerDiscoveryEvidenceInputSchema = z.object({
  interviewCount: interviewCountSchema,
  questionStyle: questionStyleSchema,
  evidenceType: evidenceTypeSchema,
  commitmentSignal: commitmentSignalSchema,
  patternConsistency: patternConsistencySchema,
});
export type CustomerDiscoveryEvidenceInput = z.infer<typeof customerDiscoveryEvidenceInputSchema>;

export const signalStrengthSchema = z.enum(["strong_signal", "mixed_signal", "weak_signal"]);
export type SignalStrength = z.infer<typeof signalStrengthSchema>;

/** Derived directly from `questionStyle` (spec v3 §37's evidence-analyser concept) — leading
 * questions cap how much the rest of the score can be trusted, regardless of how strong the
 * other four dimensions look. See scoring.ts's `QUESTION_STYLE_CAP`. */
export const biasRiskSchema = z.enum(["low", "moderate", "high"]);
export type BiasRisk = z.infer<typeof biasRiskSchema>;

export const customerDiscoveryEvidenceResultSchema = z.object({
  evidenceStrengthScore: z.number().min(0).max(100),
  signalStrength: signalStrengthSchema,
  biasRisk: biasRiskSchema,
  strongestArea: z.string(),
  weakestArea: z.string(),
  biggestUncertainty: z.string(),
  nextEvidenceAction: z.string(),
});
export type CustomerDiscoveryEvidenceResult = z.infer<typeof customerDiscoveryEvidenceResultSchema>;

import { z } from "zod";

/**
 * Reuse Taxonomy v1 (spec v7 §23.2). Mirrors `src/lib/finder/schema.ts`'s shape: the pure
 * types/schemas the deterministic scoring/suggestion functions in `scoring.ts`/`suggest.ts`
 * operate on, kept independent of the DB row shape so they're usable from both
 * `scripts/assess-abitgamey-use.ts` (import-time classification) and
 * `src/server/admin/source-posts.ts` (admin read/write) without a circular dependency.
 */

export const sourceStageSchema = z.enum(["discover", "assess", "decide", "plan", "execute", "review", "improve"]);
export type SourceStage = z.infer<typeof sourceStageSchema>;

export const frequencySchema = z.enum(["one_off", "occasional", "recurring"]);
export type Frequency = z.infer<typeof frequencySchema>;

export const judgementLevelSchema = z.enum(["low", "medium", "high"]);
export type JudgementLevel = z.infer<typeof judgementLevelSchema>;

/** Spec v7 §23.2.1's "initial controlled tags" — deliberately app-level, not a DB enum
 * (spec: "keep the vocabulary configurable rather than hard-coding it as a database enum"),
 * so the list can grow without a migration. `it_source_post_use_assessments.method_tags`
 * stores these as free-text `text[]`; this schema is what validates them on the way in. */
export const METHOD_TAGS = [
  "principle",
  "process",
  "checklist",
  "worksheet",
  "canvas",
  "decision_rule",
  "score",
  "calculation",
  "diagnostic",
  "generator",
  "comparison",
  "case_study",
  "example",
] as const;
export const methodTagSchema = z.enum(METHOD_TAGS);
export type MethodTag = z.infer<typeof methodTagSchema>;

export const sourceUseTypeSchema = z.enum(["source_only", "guide", "template", "tool"]);
export type SourceUseType = z.infer<typeof sourceUseTypeSchema>;

export const mappingStatusSchema = z.enum(["unreviewed", "accepted", "adjusted", "dismissed"]);
export type MappingStatus = z.infer<typeof mappingStatusSchema>;

/** Spec v7 line 3015. Free text in the DB (`it_framework_source_posts.contribution_type`),
 * validated against this controlled set at the application boundary. */
export const contributionTypeSchema = z.enum(["primary_method", "supporting_method", "example", "evidence", "background"]);
export type ContributionType = z.infer<typeof contributionTypeSchema>;

const componentScoreSchema = z.number().int().min(0).max(2);

export const reuseComponentScoresSchema = z.object({
  problem: componentScoreSchema,
  actionability: componentScoreSchema,
  repeatability: componentScoreSchema,
  structure: componentScoreSchema,
  automation: componentScoreSchema,
});
export type ReuseComponentScores = z.infer<typeof reuseComponentScoresSchema>;

export const taxonomyDimensionsSchema = z.object({
  problemStatement: z.string().nullable(),
  sourceStage: sourceStageSchema.nullable(),
  userTask: z.string().nullable(),
  methodTags: z.array(methodTagSchema),
  frequency: frequencySchema.nullable(),
  judgementLevel: judgementLevelSchema.nullable(),
});
export type TaxonomyDimensions = z.infer<typeof taxonomyDimensionsSchema>;

/** An entry in `it_source_post_use_assessments.suggested_frameworks` (spec v7 line 2014):
 * either an existing framework (`frameworkId` set) or a not-yet-created candidate
 * (`candidateName`/`candidateSlug` set), never both unset. Validated here rather than trusted
 * as executable configuration, per the spec's explicit instruction. */
export const suggestedFrameworkMappingSchema = z
  .object({
    frameworkId: z.string().nullable(),
    candidateName: z.string().nullable(),
    candidateSlug: z.string().nullable(),
    contributionType: contributionTypeSchema,
    outputUses: z.array(sourceUseTypeSchema).min(1),
    confidence: z.number().min(0).max(1),
    rationale: z.string(),
  })
  .refine((v) => v.frameworkId !== null || v.candidateName !== null, {
    message: "suggestedFrameworkMapping needs either frameworkId or candidateName.",
  });
export type SuggestedFrameworkMapping = z.infer<typeof suggestedFrameworkMappingSchema>;

export const sourcePostAssessmentSchema = z.object({
  taxonomyVersion: z.string(),
  analysisVersion: z.string(),
  analysisMethod: z.enum(["seeded", "rules", "ai_assisted", "manual"]),
  extractedPrinciple: z.string().nullable(),
  dimensions: taxonomyDimensionsSchema,
  scores: reuseComponentScoresSchema,
  suggestedUses: z.array(sourceUseTypeSchema).min(1),
  suggestedFrameworks: z.array(suggestedFrameworkMappingSchema),
  suggestedPublicStageKey: z.string().nullable(),
  confidence: z.number().min(0).max(1).nullable(),
  rationale: z.string().nullable(),
});
export type SourcePostAssessment = z.infer<typeof sourcePostAssessmentSchema>;

import { z } from "zod";

/**
 * Product Prioritisation Tool tool input/result schemas (spec v4 §37's "priority scorer").
 * Named-candidate scoring matrix (docs/decisions/0028, 0030, 0031, 0033): four named
 * scheduling strategies, straight from the source post's own list — Earliest Due Date,
 * Moore's Algorithm, Shortest Processing Time, Weighted Processing Time — scored across four
 * dimensions. See docs/decisions/0034.
 */
export const deadlinesSchema = z.enum(["yes_hard_deadlines", "no_flexible_timing"]);
export type Deadlines = z.infer<typeof deadlinesSchema>;

export const everythingAchievableSchema = z.enum(["yes_its_all_achievable", "no_something_has_to_give"]);
export type EverythingAchievable = z.infer<typeof everythingAchievableSchema>;

export const valueVariationSchema = z.enum(["yes_some_matter_much_more", "roughly_equally_important"]);
export type ValueVariation = z.infer<typeof valueVariationSchema>;

export const whatWouldHelpMostSchema = z.enum(["momentum_and_fewer_open_tasks", "confidence_nothing_important_slips"]);
export type WhatWouldHelpMost = z.infer<typeof whatWouldHelpMostSchema>;

export const productPrioritisationToolInputSchema = z.object({
  deadlines: deadlinesSchema,
  everythingAchievable: everythingAchievableSchema,
  valueVariation: valueVariationSchema,
  whatWouldHelpMost: whatWouldHelpMostSchema,
});
export type ProductPrioritisationToolInput = z.infer<typeof productPrioritisationToolInputSchema>;

export const schedulingStrategySchema = z.enum([
  "earliest_due_date",
  "moores_algorithm",
  "shortest_processing_time",
  "weighted_processing_time",
]);
export type SchedulingStrategy = z.infer<typeof schedulingStrategySchema>;

export const productPrioritisationToolResultSchema = z.object({
  recommendedStrategy: schedulingStrategySchema,
  rationale: z.string(),
  runnerUpStrategy: schedulingStrategySchema.nullable(),
  decidingFactor: z.string().nullable(),
  nextStep: z.string(),
});
export type ProductPrioritisationToolResult = z.infer<typeof productPrioritisationToolResultSchema>;

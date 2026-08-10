import { z } from "zod";

/**
 * Product/Market Fit Tracker PMF Score Checker input/result schemas (spec v3 §37's "PMF
 * calculator/tracker"). A single-subject Tool like Product Idea Assessor and MVP Scoper
 * (no two-way comparison, no classification field to pick a weight table) — every dimension
 * always uses the same fixed weights. `disappointmentSignal` is the Sean Ellis "how would you
 * feel if you could no longer use this" proxy, and doubles as the scoring gate in
 * `scoring.ts`: see that file for why it isn't just one more weighted input.
 */
export const ratingSchema = z.enum(["low", "medium", "high"]);
export type Rating = z.infer<typeof ratingSchema>;

export const productMarketFitTrackerInputSchema = z.object({
  disappointmentSignal: ratingSchema,
  retention: ratingSchema,
  organicGrowth: ratingSchema,
  referral: ratingSchema,
  payingIntent: ratingSchema,
});
export type ProductMarketFitTrackerInput = z.infer<typeof productMarketFitTrackerInputSchema>;

export const fitSchema = z.enum(["strong_fit", "early_signal", "no_fit"]);
export type Fit = z.infer<typeof fitSchema>;

export const productMarketFitTrackerResultSchema = z.object({
  fitScore: z.number().min(0).max(100),
  fit: fitSchema,
  disappointmentGateApplied: z.boolean(),
  strongestFactor: z.string(),
  weakestFactor: z.string(),
  biggestUncertainty: z.string(),
  guidance: z.string(),
  nextStep: z.string(),
});
export type ProductMarketFitTrackerResult = z.infer<typeof productMarketFitTrackerResultSchema>;

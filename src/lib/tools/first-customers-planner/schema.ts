import { z } from "zod";

/**
 * First Customers Planner Channel Selector input/result schemas (spec v3 §37's "channel
 * selector"). Scores how well a single acquisition channel fits the founder's specific
 * situation — the same "classify, then weight dimensions by that classification" shape
 * Product Idea Assessor uses (`channelType` plays the role `classification` did there),
 * closing the loop on the flagship set with a deliberate callback to the first Tool's
 * pattern rather than a completely novel one. The dimensions themselves and their weights
 * are new to this Tool, and `effortToStart` is scored inverted (lower effort contributes
 * more), which none of the earlier Tools needed.
 */
export const channelTypeSchema = z.enum(["cold_outreach", "content_marketing", "communities_and_forums", "existing_network"]);
export type ChannelType = z.infer<typeof channelTypeSchema>;

export const ratingSchema = z.enum(["low", "medium", "high"]);
export type Rating = z.infer<typeof ratingSchema>;

export const firstCustomersPlannerInputSchema = z.object({
  channelType: channelTypeSchema,
  audiencePresence: ratingSchema,
  founderFit: ratingSchema,
  effortToStart: ratingSchema,
  repeatability: ratingSchema,
});
export type FirstCustomersPlannerInput = z.infer<typeof firstCustomersPlannerInputSchema>;

export const fitSchema = z.enum(["strong_fit", "worth_testing", "weak_fit"]);
export type Fit = z.infer<typeof fitSchema>;

export const firstCustomersPlannerResultSchema = z.object({
  channelType: channelTypeSchema,
  fitScore: z.number().min(0).max(100),
  fit: fitSchema,
  strongestFactor: z.string(),
  weakestFactor: z.string(),
  biggestUncertainty: z.string(),
  guidance: z.string(),
  nextStep: z.string(),
});
export type FirstCustomersPlannerResult = z.infer<typeof firstCustomersPlannerResultSchema>;

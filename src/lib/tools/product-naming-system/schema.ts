import { z } from "zod";

/**
 * Product Naming System Name Comparator input/result schemas (spec v3 §37's "name
 * comparison tool"). Compares exactly two candidate names, the same two-subject shape
 * Better Decision Maker's Expected Value Comparator uses — but with a different scoring
 * formula (a plain average, not a weighted-and-divided one) and a different non-additive
 * rule: `availability` acts as a hard disqualification gate here, not a soft cap. A name
 * that's taken everywhere isn't merely worth fewer points — it's not usable at all, however
 * memorable or distinctive it is.
 */
export const ratingSchema = z.enum(["low", "medium", "high"]);
export type Rating = z.infer<typeof ratingSchema>;

export const availabilitySchema = z.enum(["taken_everywhere", "partially_available", "fully_available"]);
export type Availability = z.infer<typeof availabilitySchema>;

export const productNamingSystemInputSchema = z.object({
  nameAMemorability: ratingSchema,
  nameAClarity: ratingSchema,
  nameADistinctiveness: ratingSchema,
  nameAAvailability: availabilitySchema,
  nameBMemorability: ratingSchema,
  nameBClarity: ratingSchema,
  nameBDistinctiveness: ratingSchema,
  nameBAvailability: availabilitySchema,
});
export type ProductNamingSystemInput = z.infer<typeof productNamingSystemInputSchema>;

export const recommendationSchema = z.enum(["name_a", "name_b", "too_close_to_call", "neither_usable"]);
export type Recommendation = z.infer<typeof recommendationSchema>;

export const productNamingSystemResultSchema = z.object({
  nameAScore: z.number().min(0).max(100),
  nameBScore: z.number().min(0).max(100),
  nameAUsable: z.boolean(),
  nameBUsable: z.boolean(),
  recommendation: recommendationSchema,
  guidance: z.string(),
  nextStep: z.string(),
});
export type ProductNamingSystemResult = z.infer<typeof productNamingSystemResultSchema>;

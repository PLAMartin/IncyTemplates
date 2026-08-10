import { z } from "zod";

/**
 * Pricing Your Product tool input/result schemas (spec v3 §37's "pricing comparison / scenario
 * calculator"). Unlike every prior Tool, which scores one subject against fixed thresholds,
 * this one scores four named candidate pricing models against each other and recommends the
 * highest scorer — see `scoring.ts` for why that's the family's "new combination" of existing
 * patterns rather than a new mechanic from scratch (docs/decisions/0028).
 */
export const valueMetricSchema = z.enum(["clear", "somewhat", "none"]);
export type ValueMetric = z.infer<typeof valueMetricSchema>;

export const purchasePatternSchema = z.enum(["ongoing", "one_off"]);
export type PurchasePattern = z.infer<typeof purchasePatternSchema>;

export const customerTypeSchema = z.enum(["individual", "small_business", "enterprise"]);
export type CustomerType = z.infer<typeof customerTypeSchema>;

export const priceVisibilitySchema = z.enum(["highly_visible", "not_visible"]);
export type PriceVisibility = z.infer<typeof priceVisibilitySchema>;

export const pricingYourProductInputSchema = z.object({
  valueMetric: valueMetricSchema,
  purchasePattern: purchasePatternSchema,
  customerType: customerTypeSchema,
  priceVisibility: priceVisibilitySchema,
});
export type PricingYourProductInput = z.infer<typeof pricingYourProductInputSchema>;

export const pricingModelSchema = z.enum(["one_time", "flat_subscription", "usage_based", "tiered_subscription"]);
export type PricingModel = z.infer<typeof pricingModelSchema>;

export const pricingYourProductResultSchema = z.object({
  recommendedModel: pricingModelSchema,
  rationale: z.string(),
  runnerUpModel: pricingModelSchema.nullable(),
  decidingFactor: z.string().nullable(),
  oneOffGateApplied: z.boolean(),
  nextStep: z.string(),
});
export type PricingYourProductResult = z.infer<typeof pricingYourProductResultSchema>;

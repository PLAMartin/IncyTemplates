import { z } from "zod";

/**
 * Business Model Chooser tool input/result schemas (spec v4 §37's "model chooser"). Reuses
 * Pricing Your Product's named-candidate scoring-matrix mechanic (docs/decisions/0028) rather
 * than introducing a new one: four named business models scored against four dimensions, with
 * a runner-up and a deciding factor. Unlike Pricing Your Product, there's no disqualification
 * gate — no dimension here represents a hard categorical exclusion the way a one-off purchase
 * ruled out every subscription model; every combination here is a matter of degree, not
 * eligibility. See docs/decisions/0030.
 */
export const audienceStructureSchema = z.enum(["two_sided", "one_sided"]);
export type AudienceStructure = z.infer<typeof audienceStructureSchema>;

export const payerSchema = z.enum(["end_user_directly", "a_third_party", "whoever_initiates_a_transaction"]);
export type Payer = z.infer<typeof payerSchema>;

export const valueDeliveryPatternSchema = z.enum(["ongoing_access", "discrete_transactions"]);
export type ValueDeliveryPattern = z.infer<typeof valueDeliveryPatternSchema>;

export const growthLeverSchema = z.enum(["self_serve_or_sales_led", "network_effects", "audience_scale"]);
export type GrowthLever = z.infer<typeof growthLeverSchema>;

export const businessModelChooserInputSchema = z.object({
  audienceStructure: audienceStructureSchema,
  payer: payerSchema,
  valueDeliveryPattern: valueDeliveryPatternSchema,
  growthLever: growthLeverSchema,
});
export type BusinessModelChooserInput = z.infer<typeof businessModelChooserInputSchema>;

export const businessModelSchema = z.enum(["saas", "marketplace", "transactional", "advertising"]);
export type BusinessModel = z.infer<typeof businessModelSchema>;

export const businessModelChooserResultSchema = z.object({
  recommendedModel: businessModelSchema,
  rationale: z.string(),
  runnerUpModel: businessModelSchema.nullable(),
  decidingFactor: z.string().nullable(),
  nextStep: z.string(),
});
export type BusinessModelChooserResult = z.infer<typeof businessModelChooserResultSchema>;

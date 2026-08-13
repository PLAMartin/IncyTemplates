import "server-only";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";
import { serverEnv } from "@/lib/env/server";
import type { VisualAssetType, VisualBrief } from "@/lib/visuals/types";
import type { VisualGenerationError, VisualProviderKey } from "@/lib/visuals/providers/types";

/**
 * Placeholder per-candidate cost estimate for OpenAI jobs, in minor units of
 * VISUAL_GENERATION_BUDGET_CURRENCY. No live account/pricing data exists yet (spec v6 explicitly
 * forbids hard-coding current OpenAI prices into business logic -- §12.7/§39.4.2 -- and this
 * repo has no key to check real pricing against). Deliberately conservative and clearly named so
 * it's easy to find and replace once real pricing is available -- see
 * docs/decisions/0050-openai-visual-provider.md.
 */
const OPENAI_ESTIMATED_COST_PER_CANDIDATE_MINOR = 8;

const RATE_LIMIT_WINDOW_MINUTES = 10;
const RATE_LIMIT_MAX_JOBS = 5;

export type CreateVisualGenerationJobInput = {
  frameworkId: string | null;
  productId: string | null;
  assetType: VisualAssetType;
  providerKey: VisualProviderKey;
  providerModel: string | null;
  providerModelSnapshot?: string | null;
  visualRecipeId: string;
  visualBrief: VisualBrief;
  promptSnapshot: string;
  requestConfig: Record<string, unknown>;
  requestedCandidates: number;
  actorProfileId: string;
};

/** Estimated cost is `null` for the free/placeholder "test" provider, never a real invoice source of truth. */
function estimateCostMinor(providerKey: VisualProviderKey, candidateCount: number): number | null {
  if (providerKey === "test") return null;
  if (providerKey === "openai") return OPENAI_ESTIMATED_COST_PER_CANDIDATE_MINOR * candidateCount;
  return null;
}

/**
 * Creates the job row in `running` state (this pipeline is synchronous end-to-end today, so
 * there is no separate `queued` phase to model yet -- `queued` remains available in the enum
 * for a future async/background generation path).
 */
export async function createVisualGenerationJob(input: CreateVisualGenerationJobInput): Promise<string> {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("it_visual_generation_jobs")
    .insert({
      framework_id: input.frameworkId,
      product_id: input.productId,
      asset_type: input.assetType,
      provider_key: input.providerKey,
      provider_model: input.providerModel,
      provider_model_snapshot: input.providerModelSnapshot ?? null,
      visual_recipe_id: input.visualRecipeId,
      visual_brief: input.visualBrief,
      prompt_snapshot: input.promptSnapshot,
      request_config: input.requestConfig,
      requested_candidates: input.requestedCandidates,
      status: "running",
      estimated_cost_minor: estimateCostMinor(input.providerKey, input.requestedCandidates),
      billing_currency: serverEnv.VISUAL_GENERATION_BUDGET_CURRENCY,
      attempt_count: 1,
      started_at: new Date().toISOString(),
      created_by: input.actorProfileId,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(`Failed to create visual generation job: ${error?.message}`);
  return data.id as string;
}

export async function completeVisualGenerationJob(
  jobId: string,
  producedCandidates: number,
  requestedCandidates: number,
): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("it_visual_generation_jobs")
    .update({
      status: producedCandidates >= requestedCandidates ? "completed" : "partial",
      produced_candidates: producedCandidates,
      completed_at: new Date().toISOString(),
    })
    .eq("id", jobId);
  if (error) throw new Error(`Failed to complete visual generation job: ${error.message}`);
}

export async function failVisualGenerationJob(jobId: string, error: VisualGenerationError): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();
  const { error: updateError } = await supabase
    .from("it_visual_generation_jobs")
    .update({
      status: "failed",
      error_category: error.category,
      error_message_safe: error.message,
      completed_at: new Date().toISOString(),
    })
    .eq("id", jobId);
  if (updateError) throw new Error(`Failed to record visual generation job failure: ${updateError.message}`);
}

/**
 * Rate/budget guard (spec §39.4.2). Both checks are skipped entirely for the "test" provider --
 * free/placeholder generation must keep working even once a real budget is configured, and
 * rate-limiting exists to protect a paid external API, not this repo's own database.
 */
export async function checkVisualGenerationBudgetAndRateLimits(
  actorProfileId: string,
  providerKey: VisualProviderKey,
): Promise<void> {
  if (providerKey === "test") return;

  const supabase = getSupabaseServiceRoleClient();

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60_000).toISOString();
  const { count: recentJobCount, error: rateError } = await supabase
    .from("it_visual_generation_jobs")
    .select("id", { count: "exact", head: true })
    .eq("created_by", actorProfileId)
    .neq("provider_key", "test")
    .gte("created_at", windowStart);
  if (rateError) throw new Error(`Failed to check visual generation rate limit: ${rateError.message}`);
  if ((recentJobCount ?? 0) >= RATE_LIMIT_MAX_JOBS) {
    throw new Error(
      `Rate limit reached: ${RATE_LIMIT_MAX_JOBS} generation requests per ${RATE_LIMIT_WINDOW_MINUTES} minutes. Try again shortly.`,
    );
  }

  if (serverEnv.VISUAL_GENERATION_MONTHLY_BUDGET_MINOR === undefined) return;

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const { data: jobsThisMonth, error: budgetError } = await supabase
    .from("it_visual_generation_jobs")
    .select("estimated_cost_minor")
    .neq("provider_key", "test")
    .gte("created_at", monthStart.toISOString());
  if (budgetError) throw new Error(`Failed to check visual generation budget: ${budgetError.message}`);

  const spentMinor = (jobsThisMonth ?? []).reduce((sum, row) => sum + (row.estimated_cost_minor ?? 0), 0);
  if (spentMinor >= serverEnv.VISUAL_GENERATION_MONTHLY_BUDGET_MINOR) {
    throw new Error("Monthly visual-generation budget reached. Upload or render workflows remain available.");
  }
}

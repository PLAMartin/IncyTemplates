import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { findToolDefinition } from "@/lib/tools/registry";

export type SaveToolRunResult =
  | { ok: true; id: string }
  | { ok: false; reason: "tool_not_found" | "product_not_found" | "invalid_input" | "invalid_result" | "insert_failed" };

/**
 * Validates a completed Tool run against its own Tool's schemas and inserts it into
 * it_tool_runs (spec §14.12). `supabase` must be a service-role client — no client-side
 * INSERT policy exists on this table (see 20260813170010_it_tool_runs_rls.sql), so this is
 * the only write path, mirroring `createCheckoutSession`'s direct service-role query shape.
 *
 * `owner` is resolved by the caller (signed-in profile vs. anonymous session cookie) before
 * this is called — this function only validates and writes, it doesn't decide ownership.
 */
export async function saveToolRun(
  supabase: SupabaseClient,
  {
    toolKey,
    input,
    result,
    owner,
  }: {
    toolKey: string;
    input: unknown;
    result: unknown;
    owner: { profileId: string } | { anonymousSessionId: string };
  },
): Promise<SaveToolRunResult> {
  const definition = findToolDefinition(toolKey);
  if (!definition) {
    return { ok: false, reason: "tool_not_found" };
  }

  const parsedInput = definition.inputSchema.safeParse(input);
  if (!parsedInput.success) {
    return { ok: false, reason: "invalid_input" };
  }

  const parsedResult = definition.resultSchema.safeParse(result);
  if (!parsedResult.success) {
    return { ok: false, reason: "invalid_result" };
  }

  const { data: product, error: productError } = await supabase
    .from("it_products")
    .select("id")
    .eq("tool_key", toolKey)
    .eq("status", "published")
    .maybeSingle();

  if (productError) {
    console.error("Product lookup failed:", productError.message);
    return { ok: false, reason: "product_not_found" };
  }

  if (!product) {
    return { ok: false, reason: "product_not_found" };
  }

  const now = new Date().toISOString();
  const { data: run, error: insertError } = await supabase
    .from("it_tool_runs")
    .insert({
      product_id: product.id,
      profile_id: "profileId" in owner ? owner.profileId : null,
      anonymous_session_id: "anonymousSessionId" in owner ? owner.anonymousSessionId : null,
      status: "completed",
      tool_schema_version: definition.schemaVersion,
      input_data: parsedInput.data,
      result_data: parsedResult.data,
      started_at: now,
      completed_at: now,
    })
    .select("id")
    .single();

  if (insertError || !run) {
    console.error("Tool run insert failed:", insertError?.message);
    return { ok: false, reason: "insert_failed" };
  }

  return { ok: true, id: run.id as string };
}

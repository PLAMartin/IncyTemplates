import "server-only";
import { z } from "zod";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";

/**
 * Spec v8 §10.11.2: the visitor-facing fields every Guide/Template/Tool admin editor must
 * show and permit editing, denormalised onto `it_products`
 * (20260728155511_products_categories_stages.sql). `name`/`short_description` are NOT NULL
 * columns there, hence required here; the rest are nullable and optional.
 */
export const commonProductCopySchema = z.object({
  name: z.string().min(1, "Name is required."),
  short_description: z.string().min(1, "Short description is required."),
  full_description: z.string().optional(),
  outcome_statement: z.string().optional(),
  target_audience: z.string().optional(),
  when_to_use: z.string().optional(),
  when_not_to_use: z.string().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

export type CommonProductCopy = z.infer<typeof commonProductCopySchema>;

/**
 * Reads the common-copy portion of a product's editorial state: the currently open draft's
 * `content_data.common` if one exists (schema v2 only — v1 rows, i.e. pre-v8 Guide history,
 * never had a `common` key), falling back to the live `it_products` row. This is what lets
 * every editor form show *something* sensible on first load, whether or not a v2 revision
 * exists yet.
 */
export function resolveCommonCopy(
  draftContentData: { common?: Partial<CommonProductCopy> } | null | undefined,
  draftSchemaVersion: number | undefined,
  product: CommonProductCopy,
): CommonProductCopy {
  const draftCommon = draftSchemaVersion === 2 ? draftContentData?.common : undefined;
  return {
    name: draftCommon?.name ?? product.name,
    short_description: draftCommon?.short_description ?? product.short_description,
    full_description: draftCommon?.full_description ?? product.full_description ?? "",
    outcome_statement: draftCommon?.outcome_statement ?? product.outcome_statement ?? "",
    target_audience: draftCommon?.target_audience ?? product.target_audience ?? "",
    when_to_use: draftCommon?.when_to_use ?? product.when_to_use ?? "",
    when_not_to_use: draftCommon?.when_not_to_use ?? product.when_not_to_use ?? "",
    seo_title: draftCommon?.seo_title ?? product.seo_title ?? "",
    seo_description: draftCommon?.seo_description ?? product.seo_description ?? "",
  };
}

export type SaveEditorialDraftInput = {
  productId: string;
  /** `{ common, guide }` or `{ common, template }` — always schema v2. */
  contentData: Record<string, unknown>;
  changeNote?: string;
  actorProfileId: string;
};

/**
 * Shared draft/publish/rollback wrappers around `it_upsert_content_draft` /
 * `it_publish_content_revision` / `it_rollback_content_revision`
 * (20260812090010_it_product_content_revisions.sql, extended for common-copy publish by
 * 20260817150000_editorial_common_copy_publish.sql). One editorial contract for Guide,
 * Template, and Tool common-copy admin code (spec v8 §12.3.1) instead of each type
 * duplicating the same three RPC calls.
 */
export async function saveEditorialDraft(input: SaveEditorialDraftInput): Promise<string> {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase.rpc("it_upsert_content_draft", {
    p_product_id: input.productId,
    p_content_data: input.contentData,
    p_actor_profile_id: input.actorProfileId,
    p_change_note: input.changeNote ?? null,
    p_content_schema_version: 2,
  });
  if (error || !data) throw new Error(`Failed to save draft: ${error?.message ?? "unknown error"}`);
  return (data as { id: string }).id;
}

export async function publishEditorialRevision(revisionId: string, actorProfileId: string): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();
  const { error } = await supabase.rpc("it_publish_content_revision", {
    p_revision_id: revisionId,
    p_actor_profile_id: actorProfileId,
  });
  if (error) throw new Error(`Failed to publish: ${error.message}`);
}

export async function rollbackEditorialRevision(
  productId: string,
  sourceRevisionId: string,
  actorProfileId: string,
  reason?: string,
): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();
  const { error } = await supabase.rpc("it_rollback_content_revision", {
    p_product_id: productId,
    p_source_revision_id: sourceRevisionId,
    p_actor_profile_id: actorProfileId,
    p_reason: reason ?? null,
  });
  if (error) throw new Error(`Failed to roll back: ${error.message}`);
}

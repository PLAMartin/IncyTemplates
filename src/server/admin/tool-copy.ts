import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";
import { findToolDefinition, listRegisteredToolKeys } from "@/lib/tools/registry";
import type { ToolCopySchema } from "@/lib/tools/types";
import { resolveCommonCopy, type CommonProductCopy } from "@/server/admin/editorial-content";

export type AdminToolListItem = {
  toolKey: string;
  productId: string | null;
  name: string | null;
  hasCopySchema: boolean;
};

/**
 * Every registered Tool, joined with its `it_products` row for display —
 * `hasCopySchema` distinguishes the ones with admin-editable copy today
 * (only mvp-scoper so far — see the Phase 6 build notes) from the rest,
 * which still show up here but have nothing to edit yet.
 */
export async function listToolsForAdmin(): Promise<AdminToolListItem[]> {
  const toolKeys = listRegisteredToolKeys();
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("it_products").select("id, name, tool_key").in("tool_key", toolKeys);
  if (error) throw new Error(`Failed to load tools: ${error.message}`);

  const productByToolKey = new Map((data ?? []).map((row) => [row.tool_key as string, row]));
  return toolKeys.map((toolKey) => {
    const product = productByToolKey.get(toolKey);
    return {
      toolKey,
      productId: product?.id ?? null,
      name: product?.name ?? null,
      hasCopySchema: Boolean(findToolDefinition(toolKey)?.copySchema),
    };
  });
}

export type AdminToolCopyRevision = {
  id: string;
  revision_number: number;
  content_data: Record<string, string>;
  change_note: string | null;
  created_at: string;
  published_at: string | null;
};

export type AdminCommonCopyRevision = {
  id: string;
  revision_number: number;
  content_schema_version: number;
  content_data: { common?: Partial<CommonProductCopy> };
  change_note: string | null;
  created_at: string;
  published_at: string | null;
};

export type AdminToolCopyDetail = {
  toolKey: string;
  productId: string | null;
  schema: ToolCopySchema;
  draftRevision: AdminToolCopyRevision | null;
  publishedRevision: AdminToolCopyRevision | null;
  history: AdminToolCopyRevision[];
  commonCopy: CommonProductCopy;
  commonPublishedRevisionId: string | null;
  commonHistory: AdminCommonCopyRevision[];
};

const EMPTY_COMMON_COPY: CommonProductCopy = {
  name: "",
  short_description: "",
  full_description: "",
  outcome_statement: "",
  target_audience: "",
  when_to_use: "",
  when_not_to_use: "",
  seo_title: "",
  seo_description: "",
};

/**
 * Loads the Tool-specific copy (existing behaviour) plus, per spec v8 §10.11.5, the common
 * product copy for the `it_products` row this `tool_key` backs — resolved the same way as
 * Guide/Template (`resolveCommonCopy`), so the Tool editor shows the same "draft > published >
 * live" precedence for common fields as the other two admin editors.
 */
export async function getToolCopyForAdmin(toolKey: string): Promise<AdminToolCopyDetail | null> {
  const definition = findToolDefinition(toolKey);
  if (!definition?.copySchema) return null;

  const supabase = await getSupabaseServerClient();

  const [{ data: revisions, error }, { data: product, error: productError }] = await Promise.all([
    supabase
      .from("it_tool_copy_revisions")
      .select("id, revision_number, content_data, change_note, created_at, published_at")
      .eq("tool_key", toolKey)
      .order("revision_number", { ascending: false }),
    supabase
      .from("it_products")
      .select(
        "id, name, short_description, full_description, outcome_statement, target_audience, when_to_use, when_not_to_use, seo_title, seo_description, current_content_revision_id",
      )
      .eq("tool_key", toolKey)
      .maybeSingle(),
  ]);
  if (error) throw new Error(`Failed to load tool copy: ${error.message}`);
  if (productError) throw new Error(`Failed to load tool product: ${productError.message}`);

  const all = (revisions ?? []) as unknown as AdminToolCopyRevision[];
  const draftRevision = all.find((r) => r.published_at === null) ?? null;
  const publishedRevision = all.find((r) => r.published_at !== null) ?? null;
  const history = all.filter((r) => r.published_at !== null);

  if (!product) {
    return {
      toolKey,
      productId: null,
      schema: definition.copySchema,
      draftRevision,
      publishedRevision,
      history,
      commonCopy: EMPTY_COMMON_COPY,
      commonPublishedRevisionId: null,
      commonHistory: [],
    };
  }

  const { data: commonRevisions, error: commonError } = await supabase
    .from("it_product_content_revisions")
    .select("id, revision_number, content_schema_version, content_data, change_note, created_at, published_at")
    .eq("product_id", product.id)
    .order("revision_number", { ascending: false });
  if (commonError) throw new Error(`Failed to load common copy: ${commonError.message}`);

  const allCommon = (commonRevisions ?? []) as unknown as AdminCommonCopyRevision[];
  const commonDraft = allCommon.find((r) => r.published_at === null) ?? null;
  const commonHistory = allCommon.filter((r) => r.published_at !== null);
  const editableCommon = commonDraft ?? allCommon.find((r) => r.id === product.current_content_revision_id) ?? null;

  return {
    toolKey,
    productId: product.id,
    schema: definition.copySchema,
    draftRevision,
    publishedRevision,
    history,
    commonCopy: resolveCommonCopy(editableCommon?.content_data, editableCommon?.content_schema_version, product),
    commonPublishedRevisionId: product.current_content_revision_id ?? null,
    commonHistory,
  };
}

export type SaveToolCopyDraftInput = {
  toolKey: string;
  contentData: Record<string, string>;
  changeNote?: string;
  actorProfileId: string;
};

/** Write path: service-role, same reasoning as admin/guides.ts. */
export async function saveToolCopyDraft(input: SaveToolCopyDraftInput): Promise<string> {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase.rpc("it_upsert_tool_copy_draft", {
    p_tool_key: input.toolKey,
    p_content_data: input.contentData,
    p_actor_profile_id: input.actorProfileId,
    p_change_note: input.changeNote ?? null,
  });
  if (error || !data) throw new Error(`Failed to save draft: ${error?.message ?? "unknown error"}`);
  return (data as { id: string }).id;
}

export async function publishToolCopyRevision(revisionId: string, actorProfileId: string): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();
  const { error } = await supabase.rpc("it_publish_tool_copy_revision", {
    p_revision_id: revisionId,
    p_actor_profile_id: actorProfileId,
  });
  if (error) throw new Error(`Failed to publish: ${error.message}`);
}

export async function rollbackToolCopyRevision(
  toolKey: string,
  sourceRevisionId: string,
  actorProfileId: string,
  reason?: string,
): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();
  const { error } = await supabase.rpc("it_rollback_tool_copy_revision", {
    p_tool_key: toolKey,
    p_source_revision_id: sourceRevisionId,
    p_actor_profile_id: actorProfileId,
    p_reason: reason ?? null,
  });
  if (error) throw new Error(`Failed to roll back: ${error.message}`);
}

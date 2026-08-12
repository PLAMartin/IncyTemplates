import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";
import { findToolDefinition, listRegisteredToolKeys } from "@/lib/tools/registry";
import type { ToolCopySchema } from "@/lib/tools/types";

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

export type AdminToolCopyDetail = {
  toolKey: string;
  schema: ToolCopySchema;
  draftRevision: AdminToolCopyRevision | null;
  publishedRevision: AdminToolCopyRevision | null;
  history: AdminToolCopyRevision[];
};

export async function getToolCopyForAdmin(toolKey: string): Promise<AdminToolCopyDetail | null> {
  const definition = findToolDefinition(toolKey);
  if (!definition?.copySchema) return null;

  const supabase = await getSupabaseServerClient();
  const { data: revisions, error } = await supabase
    .from("it_tool_copy_revisions")
    .select("id, revision_number, content_data, change_note, created_at, published_at")
    .eq("tool_key", toolKey)
    .order("revision_number", { ascending: false });
  if (error) throw new Error(`Failed to load tool copy: ${error.message}`);

  const all = (revisions ?? []) as unknown as AdminToolCopyRevision[];
  const draftRevision = all.find((r) => r.published_at === null) ?? null;
  const publishedRevision = all.find((r) => r.published_at !== null) ?? null;
  const history = all.filter((r) => r.published_at !== null);

  return { toolKey, schema: definition.copySchema, draftRevision, publishedRevision, history };
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

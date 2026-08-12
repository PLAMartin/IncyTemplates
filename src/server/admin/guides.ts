import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";
import type { PublicVisibility } from "@/types/admin";

export type AdminGuideListItem = {
  id: string;
  slug: string;
  name: string;
  status: string;
  public_visibility: PublicVisibility;
  updated_at: string;
  has_open_draft: boolean;
};

/** List (read path, session-bound RLS-respecting client — see admin/frameworks.ts for why). */
export async function listGuidesForAdmin(): Promise<AdminGuideListItem[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("it_products")
    .select("id, slug, name, status, public_visibility, updated_at")
    .eq("product_type", "guide")
    .order("name", { ascending: true });
  if (error) throw new Error(`Failed to load guides: ${error.message}`);

  const rows = data ?? [];
  if (rows.length === 0) return [];

  const { data: drafts } = await supabase
    .from("it_product_content_revisions")
    .select("product_id")
    .is("published_at", null)
    .in(
      "product_id",
      rows.map((r) => r.id),
    );
  const draftProductIds = new Set((drafts ?? []).map((d) => d.product_id));

  return rows.map((row) => ({ ...row, has_open_draft: draftProductIds.has(row.id) }));
}

export type GuideContentData = { body_markdown: string; author: string };

export type AdminGuideRevision = {
  id: string;
  revision_number: number;
  content_data: GuideContentData;
  change_note: string | null;
  created_at: string;
  published_at: string | null;
};

export type AdminGuideDetail = {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  status: string;
  public_visibility: PublicVisibility;
  publishedRevision: AdminGuideRevision | null;
  draftRevision: AdminGuideRevision | null;
  history: AdminGuideRevision[];
};

export async function getGuideForAdmin(productId: string): Promise<AdminGuideDetail | null> {
  const supabase = await getSupabaseServerClient();

  const { data: product, error: productError } = await supabase
    .from("it_products")
    .select("id, slug, name, short_description, status, public_visibility, current_content_revision_id")
    .eq("id", productId)
    .eq("product_type", "guide")
    .maybeSingle();
  if (productError) throw new Error(`Failed to load guide: ${productError.message}`);
  if (!product) return null;

  const { data: revisions, error: revisionsError } = await supabase
    .from("it_product_content_revisions")
    .select("id, revision_number, content_data, change_note, created_at, published_at")
    .eq("product_id", productId)
    .order("revision_number", { ascending: false });
  if (revisionsError) throw new Error(`Failed to load revisions: ${revisionsError.message}`);

  const all = (revisions ?? []) as unknown as AdminGuideRevision[];
  const draftRevision = all.find((r) => r.published_at === null) ?? null;
  const publishedRevision = all.find((r) => r.id === product.current_content_revision_id) ?? null;
  const history = all.filter((r) => r.published_at !== null);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    short_description: product.short_description,
    status: product.status,
    public_visibility: product.public_visibility,
    publishedRevision,
    draftRevision,
    history,
  };
}

export type SaveGuideDraftInput = {
  productId: string;
  contentData: GuideContentData;
  changeNote?: string;
  actorProfileId: string;
};

/** Write path: service-role — see admin/frameworks.ts for why this repo's writes bypass RLS. */
export async function saveGuideDraft(input: SaveGuideDraftInput): Promise<string> {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase.rpc("it_upsert_content_draft", {
    p_product_id: input.productId,
    p_content_data: input.contentData,
    p_actor_profile_id: input.actorProfileId,
    p_change_note: input.changeNote ?? null,
  });
  if (error || !data) throw new Error(`Failed to save draft: ${error?.message ?? "unknown error"}`);
  return (data as { id: string }).id;
}

export async function publishGuideRevision(revisionId: string, actorProfileId: string): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();
  const { error } = await supabase.rpc("it_publish_content_revision", {
    p_revision_id: revisionId,
    p_actor_profile_id: actorProfileId,
  });
  if (error) throw new Error(`Failed to publish: ${error.message}`);
}

export async function rollbackGuideRevision(
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

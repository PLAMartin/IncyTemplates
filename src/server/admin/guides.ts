import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { PublicVisibility } from "@/types/admin";
import {
  saveEditorialDraft,
  publishEditorialRevision,
  rollbackEditorialRevision,
  resolveCommonCopy,
  type CommonProductCopy,
} from "@/server/admin/editorial-content";

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

export type GuideTypeCopy = { body_markdown: string; author: string };

/**
 * Raw row shape as stored: v1 (all pre-v8 history) is the flat `GuideTypeCopy` itself; v2
 * nests it under `guide` alongside `common`. `resolveGuideCopy` below is what turns either
 * shape into a `GuideTypeCopy` a caller can use without checking the version itself.
 */
type RawGuideContentData = GuideTypeCopy | ({ common?: Partial<CommonProductCopy> } & { guide?: Partial<GuideTypeCopy> });

export type AdminGuideRevision = {
  id: string;
  revision_number: number;
  content_schema_version: number;
  content_data: RawGuideContentData;
  change_note: string | null;
  created_at: string;
  published_at: string | null;
};

export type AdminGuideDetail = {
  id: string;
  slug: string;
  name: string;
  status: string;
  public_visibility: PublicVisibility;
  commonCopy: CommonProductCopy;
  guideCopy: GuideTypeCopy;
  publishedRevision: AdminGuideRevision | null;
  draftRevision: AdminGuideRevision | null;
  history: AdminGuideRevision[];
};

function resolveGuideCopy(revision: AdminGuideRevision | null): GuideTypeCopy {
  if (!revision) return { body_markdown: "", author: "" };
  const data = revision.content_data;
  const guide = revision.content_schema_version === 2 ? (data as { guide?: Partial<GuideTypeCopy> }).guide : (data as GuideTypeCopy);
  return { body_markdown: guide?.body_markdown ?? "", author: guide?.author ?? "" };
}

export async function getGuideForAdmin(productId: string): Promise<AdminGuideDetail | null> {
  const supabase = await getSupabaseServerClient();

  const { data: product, error: productError } = await supabase
    .from("it_products")
    .select(
      "id, slug, name, short_description, full_description, outcome_statement, target_audience, when_to_use, when_not_to_use, seo_title, seo_description, status, public_visibility, current_content_revision_id",
    )
    .eq("id", productId)
    .eq("product_type", "guide")
    .maybeSingle();
  if (productError) throw new Error(`Failed to load guide: ${productError.message}`);
  if (!product) return null;

  const { data: revisions, error: revisionsError } = await supabase
    .from("it_product_content_revisions")
    .select("id, revision_number, content_schema_version, content_data, change_note, created_at, published_at")
    .eq("product_id", productId)
    .order("revision_number", { ascending: false });
  if (revisionsError) throw new Error(`Failed to load revisions: ${revisionsError.message}`);

  const all = (revisions ?? []) as unknown as AdminGuideRevision[];
  const draftRevision = all.find((r) => r.published_at === null) ?? null;
  const publishedRevision = all.find((r) => r.id === product.current_content_revision_id) ?? null;
  const history = all.filter((r) => r.published_at !== null);

  const editableRevision = draftRevision ?? publishedRevision;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    status: product.status,
    public_visibility: product.public_visibility,
    commonCopy: resolveCommonCopy(
      editableRevision?.content_schema_version === 2 ? (editableRevision.content_data as { common?: Partial<CommonProductCopy> }) : undefined,
      editableRevision?.content_schema_version,
      product,
    ),
    guideCopy: resolveGuideCopy(editableRevision),
    publishedRevision,
    draftRevision,
    history,
  };
}

export type SaveGuideDraftInput = {
  productId: string;
  commonCopy: CommonProductCopy;
  guideCopy: GuideTypeCopy;
  changeNote?: string;
  actorProfileId: string;
};

export async function saveGuideDraft(input: SaveGuideDraftInput): Promise<string> {
  return saveEditorialDraft({
    productId: input.productId,
    contentData: { common: input.commonCopy, guide: input.guideCopy },
    changeNote: input.changeNote,
    actorProfileId: input.actorProfileId,
  });
}

export const publishGuideRevision = publishEditorialRevision;
export const rollbackGuideRevision = rollbackEditorialRevision;

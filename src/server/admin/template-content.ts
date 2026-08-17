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

/**
 * Spec v8 §10.11.4: the Template-specific editorial fields, alongside the common copy from
 * §10.11.2. All optional except `instructions_markdown` — a Template can exist with just its
 * file(s) and common copy while an editor is still writing the fuller guidance.
 */
export type TemplateTypeCopy = {
  instructions_markdown: string;
  required_inputs: string;
  whats_included: string;
  example_markdown: string;
  interpretation_guidance: string;
  cta_copy: string;
};

const EMPTY_TEMPLATE_COPY: TemplateTypeCopy = {
  instructions_markdown: "",
  required_inputs: "",
  whats_included: "",
  example_markdown: "",
  interpretation_guidance: "",
  cta_copy: "",
};

export type AdminTemplateContentRevision = {
  id: string;
  revision_number: number;
  content_schema_version: number;
  content_data: { common?: Partial<CommonProductCopy>; template?: Partial<TemplateTypeCopy> };
  change_note: string | null;
  created_at: string;
  published_at: string | null;
};

export type AdminTemplateContentDetail = {
  id: string;
  slug: string;
  name: string;
  status: string;
  public_visibility: PublicVisibility;
  commonCopy: CommonProductCopy;
  templateCopy: TemplateTypeCopy;
  publishedRevision: AdminTemplateContentRevision | null;
  draftRevision: AdminTemplateContentRevision | null;
  history: AdminTemplateContentRevision[];
};

function resolveTemplateCopy(revision: AdminTemplateContentRevision | null): TemplateTypeCopy {
  const template = revision?.content_schema_version === 2 ? revision.content_data.template : undefined;
  return {
    instructions_markdown: template?.instructions_markdown ?? EMPTY_TEMPLATE_COPY.instructions_markdown,
    required_inputs: template?.required_inputs ?? EMPTY_TEMPLATE_COPY.required_inputs,
    whats_included: template?.whats_included ?? EMPTY_TEMPLATE_COPY.whats_included,
    example_markdown: template?.example_markdown ?? EMPTY_TEMPLATE_COPY.example_markdown,
    interpretation_guidance: template?.interpretation_guidance ?? EMPTY_TEMPLATE_COPY.interpretation_guidance,
    cta_copy: template?.cta_copy ?? EMPTY_TEMPLATE_COPY.cta_copy,
  };
}

/**
 * Editorial content (common copy + instructions/guidance) for a Template — separate from
 * `getTemplateForAdmin` (admin/templates.ts), which covers file versions. Spec v8 §10.11.4
 * requires these as two clearly separate sections/actions on the same admin page, not one
 * combined form, so they stay separate server modules too.
 */
export async function getTemplateContentForAdmin(productId: string): Promise<AdminTemplateContentDetail | null> {
  const supabase = await getSupabaseServerClient();

  const { data: product, error: productError } = await supabase
    .from("it_products")
    .select(
      "id, slug, name, short_description, full_description, outcome_statement, target_audience, when_to_use, when_not_to_use, seo_title, seo_description, status, public_visibility, current_content_revision_id",
    )
    .eq("id", productId)
    .eq("product_type", "template")
    .maybeSingle();
  if (productError) throw new Error(`Failed to load template: ${productError.message}`);
  if (!product) return null;

  const { data: revisions, error: revisionsError } = await supabase
    .from("it_product_content_revisions")
    .select("id, revision_number, content_schema_version, content_data, change_note, created_at, published_at")
    .eq("product_id", productId)
    .order("revision_number", { ascending: false });
  if (revisionsError) throw new Error(`Failed to load revisions: ${revisionsError.message}`);

  const all = (revisions ?? []) as unknown as AdminTemplateContentRevision[];
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
    commonCopy: resolveCommonCopy(editableRevision?.content_data, editableRevision?.content_schema_version, product),
    templateCopy: resolveTemplateCopy(editableRevision),
    publishedRevision,
    draftRevision,
    history,
  };
}

export type SaveTemplateContentDraftInput = {
  productId: string;
  commonCopy: CommonProductCopy;
  templateCopy: TemplateTypeCopy;
  changeNote?: string;
  actorProfileId: string;
};

export async function saveTemplateContentDraft(input: SaveTemplateContentDraftInput): Promise<string> {
  return saveEditorialDraft({
    productId: input.productId,
    contentData: { common: input.commonCopy, template: input.templateCopy },
    changeNote: input.changeNote,
    actorProfileId: input.actorProfileId,
  });
}

export const publishTemplateContentRevision = publishEditorialRevision;
export const rollbackTemplateContentRevision = rollbackEditorialRevision;

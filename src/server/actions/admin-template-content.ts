"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/dal";
import {
  saveTemplateContentDraft,
  publishTemplateContentRevision,
  rollbackTemplateContentRevision,
} from "@/server/admin/template-content";
import { commonProductCopySchema } from "@/server/admin/editorial-content";
import { zId } from "@/lib/utils/id";

export type AdminActionResult = { status: "success" } | { status: "invalid" | "error"; message: string };

const saveDraftSchema = z.object({
  productId: zId,
  common: commonProductCopySchema,
  instructionsMarkdown: z.string().min(1, "Instructions can't be empty."),
  requiredInputs: z.string().optional(),
  whatsIncluded: z.string().optional(),
  exampleMarkdown: z.string().optional(),
  interpretationGuidance: z.string().optional(),
  ctaCopy: z.string().optional(),
  changeNote: z.string().max(500).optional(),
});

function toTemplateCopy(data: z.infer<typeof saveDraftSchema>) {
  return {
    instructions_markdown: data.instructionsMarkdown,
    required_inputs: data.requiredInputs ?? "",
    whats_included: data.whatsIncluded ?? "",
    example_markdown: data.exampleMarkdown ?? "",
    interpretation_guidance: data.interpretationGuidance ?? "",
    cta_copy: data.ctaCopy ?? "",
  };
}

/** Same 'editor' floor as the file-version action in admin-templates.ts. */
export async function saveTemplateContentDraftAction(input: z.infer<typeof saveDraftSchema>): Promise<AdminActionResult> {
  const parsed = saveDraftSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const session = await requireRole("editor");
  try {
    await saveTemplateContentDraft({
      productId: parsed.data.productId,
      commonCopy: parsed.data.common,
      templateCopy: toTemplateCopy(parsed.data),
      changeNote: parsed.data.changeNote,
      actorProfileId: session.userId,
    });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }
  revalidatePath("/admin/templates");
  return { status: "success" };
}

export async function saveAndPublishTemplateContentAction(input: z.infer<typeof saveDraftSchema>): Promise<AdminActionResult> {
  const parsed = saveDraftSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const session = await requireRole("editor");
  try {
    const revisionId = await saveTemplateContentDraft({
      productId: parsed.data.productId,
      commonCopy: parsed.data.common,
      templateCopy: toTemplateCopy(parsed.data),
      changeNote: parsed.data.changeNote,
      actorProfileId: session.userId,
    });
    await publishTemplateContentRevision(revisionId, session.userId);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }
  revalidatePath("/admin/templates");
  revalidatePath("/templates");
  return { status: "success" };
}

const rollbackSchema = z.object({ productId: zId, sourceRevisionId: z.uuid(), reason: z.string().max(500).optional() });

/**
 * Positional args, not a single object — see rollbackGuideRevisionAction's doc comment
 * (admin-guides.ts) for why: a Server Component must pass a bound Server Action reference
 * (`.bind(null, productId)`) to the Client Component rollback list, not a wrapping closure.
 */
export async function rollbackTemplateContentAction(
  productId: string,
  sourceRevisionId: string,
  reason?: string,
): Promise<AdminActionResult> {
  const parsed = rollbackSchema.safeParse({ productId, sourceRevisionId, reason });
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const session = await requireRole("editor");
  try {
    await rollbackTemplateContentRevision(parsed.data.productId, parsed.data.sourceRevisionId, session.userId, parsed.data.reason);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }
  revalidatePath("/admin/templates");
  revalidatePath("/templates");
  return { status: "success" };
}

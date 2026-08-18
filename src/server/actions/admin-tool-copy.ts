"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/dal";
import { saveToolCopyDraft, publishToolCopyRevision, rollbackToolCopyRevision } from "@/server/admin/tool-copy";
import {
  saveEditorialDraft,
  publishEditorialRevision,
  rollbackEditorialRevision,
  commonProductCopySchema,
} from "@/server/admin/editorial-content";
import { zId } from "@/lib/utils/id";

export type AdminActionResult = { status: "success" } | { status: "invalid" | "error"; message: string };

const saveDraftSchema = z.object({
  toolKey: z.string().min(1),
  contentData: z.record(z.string(), z.string()),
  changeNote: z.string().max(500).optional(),
});

/** Same 'editor' floor as Template file versions / Guide content — Tool presentation config is an Editor capability per spec §14's role matrix. */
export async function saveAndPublishToolCopyAction(input: z.infer<typeof saveDraftSchema>): Promise<AdminActionResult> {
  const parsed = saveDraftSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const session = await requireRole("editor");
  try {
    const revisionId = await saveToolCopyDraft({
      toolKey: parsed.data.toolKey,
      contentData: parsed.data.contentData,
      changeNote: parsed.data.changeNote,
      actorProfileId: session.userId,
    });
    await publishToolCopyRevision(revisionId, session.userId);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }
  revalidatePath("/admin/tools");
  revalidatePath(`/tools/${parsed.data.toolKey}`);
  return { status: "success" };
}

export async function saveToolCopyDraftAction(input: z.infer<typeof saveDraftSchema>): Promise<AdminActionResult> {
  const parsed = saveDraftSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const session = await requireRole("editor");
  try {
    await saveToolCopyDraft({
      toolKey: parsed.data.toolKey,
      contentData: parsed.data.contentData,
      changeNote: parsed.data.changeNote,
      actorProfileId: session.userId,
    });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }
  revalidatePath("/admin/tools");
  return { status: "success" };
}

const rollbackSchema = z.object({ toolKey: z.string().min(1), sourceRevisionId: z.uuid(), reason: z.string().max(500).optional() });

/**
 * Positional args, not a single object — see rollbackGuideRevisionAction's doc comment
 * (admin-guides.ts) for why: a Server Component must pass a bound Server Action reference
 * (`.bind(null, toolKey)`) to the Client Component rollback list, not a wrapping closure.
 */
export async function rollbackToolCopyAction(
  toolKey: string,
  sourceRevisionId: string,
  reason?: string,
): Promise<AdminActionResult> {
  const parsed = rollbackSchema.safeParse({ toolKey, sourceRevisionId, reason });
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const session = await requireRole("editor");
  try {
    await rollbackToolCopyRevision(parsed.data.toolKey, parsed.data.sourceRevisionId, session.userId, parsed.data.reason);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }
  revalidatePath("/admin/tools");
  revalidatePath(`/tools/${parsed.data.toolKey}`);
  return { status: "success" };
}

const saveContentDraftSchema = z.object({
  toolKey: z.string().min(1),
  productId: zId.nullable(),
  common: commonProductCopySchema,
  toolContentData: z.record(z.string(), z.string()),
  changeNote: z.string().max(500).optional(),
});

/**
 * Bundles the common product-copy save (`it_product_content_revisions`, via the shared
 * editorial service) with the existing Tool-specific copy save (`it_tool_copy_revisions`) so
 * the Tool editor presents one Save/Publish action even though the two live in separate
 * tables (spec v8 §10.11.5 + the build decision to keep `it_tool_copy_revisions` rather than
 * migrate it — see docs/decisions/0061-admin-editorial-parity.md). `productId` is null only
 * for a tool_key with no backing `it_products` row yet, in which case the common-copy half is
 * skipped.
 */
async function saveToolContent(input: z.infer<typeof saveContentDraftSchema>, actorProfileId: string, publish: boolean): Promise<void> {
  if (input.productId) {
    const commonRevisionId = await saveEditorialDraft({
      productId: input.productId,
      contentData: { common: input.common },
      changeNote: input.changeNote,
      actorProfileId,
    });
    if (publish) await publishEditorialRevision(commonRevisionId, actorProfileId);
  }

  const toolRevisionId = await saveToolCopyDraft({
    toolKey: input.toolKey,
    contentData: input.toolContentData,
    changeNote: input.changeNote,
    actorProfileId,
  });
  if (publish) await publishToolCopyRevision(toolRevisionId, actorProfileId);
}

export async function saveToolContentDraftAction(input: z.infer<typeof saveContentDraftSchema>): Promise<AdminActionResult> {
  const parsed = saveContentDraftSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const session = await requireRole("editor");
  try {
    await saveToolContent(parsed.data, session.userId, false);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }
  revalidatePath("/admin/tools");
  return { status: "success" };
}

export async function saveAndPublishToolContentAction(input: z.infer<typeof saveContentDraftSchema>): Promise<AdminActionResult> {
  const parsed = saveContentDraftSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const session = await requireRole("editor");
  try {
    await saveToolContent(parsed.data, session.userId, true);
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? `${error.message} (if common copy published before this failed, it is live — retry to finish publishing tool copy)`
          : "Something went wrong.",
    };
  }
  revalidatePath("/admin/tools");
  revalidatePath(`/tools/${parsed.data.toolKey}`);
  return { status: "success" };
}

const rollbackCommonCopySchema = z.object({ productId: zId, sourceRevisionId: z.uuid(), reason: z.string().max(500).optional() });

/**
 * Rolls back only the common-copy revision for the product a `tool_key` backs — independent of
 * Tool-specific copy rollback (`rollbackToolCopyAction` above), since the two are separate
 * revision timelines. Positional args, not a single object — see rollbackGuideRevisionAction's
 * doc comment (admin-guides.ts) for why.
 */
export async function rollbackToolCommonCopyAction(
  productId: string,
  sourceRevisionId: string,
  reason?: string,
): Promise<AdminActionResult> {
  const parsed = rollbackCommonCopySchema.safeParse({ productId, sourceRevisionId, reason });
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const session = await requireRole("editor");
  try {
    await rollbackEditorialRevision(parsed.data.productId, parsed.data.sourceRevisionId, session.userId, parsed.data.reason);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }
  revalidatePath("/admin/tools");
  return { status: "success" };
}

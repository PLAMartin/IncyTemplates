"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/dal";
import { saveGuideDraft, publishGuideRevision, rollbackGuideRevision } from "@/server/admin/guides";
import { zId } from "@/lib/utils/id";

export type AdminActionResult = { status: "success" } | { status: "invalid" | "error"; message: string };

const saveDraftSchema = z.object({
  productId: zId,
  bodyMarkdown: z.string().min(1, "Body can't be empty."),
  author: z.string().min(1, "Author is required."),
  changeNote: z.string().max(500).optional(),
});

/** Editors can draft/save; publishing/rollback also only need 'editor' per spec §16.3's matrix (visibility changes are the 'admin'-only action, not content edits). */
export async function saveGuideDraftAction(input: z.infer<typeof saveDraftSchema>): Promise<AdminActionResult> {
  const parsed = saveDraftSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const session = await requireRole("editor");
  try {
    await saveGuideDraft({
      productId: parsed.data.productId,
      contentData: { body_markdown: parsed.data.bodyMarkdown, author: parsed.data.author },
      changeNote: parsed.data.changeNote,
      actorProfileId: session.userId,
    });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }
  revalidatePath(`/admin/guides`);
  return { status: "success" };
}

/** Save-then-publish in one call, for the editor's "Publish" button (avoids a client round trip to learn the new draft's revision id before it can publish it). */
export async function saveAndPublishGuideAction(input: z.infer<typeof saveDraftSchema>): Promise<AdminActionResult> {
  const parsed = saveDraftSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const session = await requireRole("editor");
  try {
    const revisionId = await saveGuideDraft({
      productId: parsed.data.productId,
      contentData: { body_markdown: parsed.data.bodyMarkdown, author: parsed.data.author },
      changeNote: parsed.data.changeNote,
      actorProfileId: session.userId,
    });
    await publishGuideRevision(revisionId, session.userId);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }
  revalidatePath(`/admin/guides`);
  revalidatePath(`/guides`);
  return { status: "success" };
}

const publishSchema = z.object({ revisionId: z.uuid() });

export async function publishGuideRevisionAction(input: z.infer<typeof publishSchema>): Promise<AdminActionResult> {
  const parsed = publishSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const session = await requireRole("editor");
  try {
    await publishGuideRevision(parsed.data.revisionId, session.userId);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }
  revalidatePath(`/admin/guides`);
  revalidatePath(`/guides`);
  return { status: "success" };
}

const rollbackSchema = z.object({ productId: zId, sourceRevisionId: z.uuid(), reason: z.string().max(500).optional() });

export async function rollbackGuideRevisionAction(input: z.infer<typeof rollbackSchema>): Promise<AdminActionResult> {
  const parsed = rollbackSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const session = await requireRole("editor");
  try {
    await rollbackGuideRevision(parsed.data.productId, parsed.data.sourceRevisionId, session.userId, parsed.data.reason);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }
  revalidatePath(`/admin/guides`);
  revalidatePath(`/guides`);
  return { status: "success" };
}

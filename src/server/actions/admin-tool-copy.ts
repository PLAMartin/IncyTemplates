"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/dal";
import { saveToolCopyDraft, publishToolCopyRevision, rollbackToolCopyRevision } from "@/server/admin/tool-copy";

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

export async function rollbackToolCopyAction(input: z.infer<typeof rollbackSchema>): Promise<AdminActionResult> {
  const parsed = rollbackSchema.safeParse(input);
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

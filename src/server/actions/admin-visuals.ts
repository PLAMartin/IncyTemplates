"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/dal";
import {
  generateVisualCandidates,
  uploadVisualCandidate,
  selectVisualCandidate,
  rejectVisualCandidate,
  updateVisualAltText,
  publishVisualAsset,
} from "@/server/admin/visuals";
import { zId } from "@/lib/utils/id";

export type AdminActionResult = { status: "success" } | { status: "invalid" | "error"; message: string };

const ASSET_TYPES = ["family_card", "family_hero", "guide_diagram", "template_preview", "tool_preview", "social_og"] as const;

const briefSchema = z.object({
  objective: z.string().min(1, "Objective is required."),
  subject: z.string().min(1, "Subject is required."),
  inputConcepts: z.array(z.string()).optional(),
  processConcept: z.string().optional(),
  outcomeConcept: z.string().optional(),
  allowedShortLabels: z.array(z.string()).optional(),
  forbiddenContent: z.array(z.string()).optional(),
  compositionHint: z.string().optional(),
  assetType: z.enum(ASSET_TYPES),
  notes: z.string().optional(),
});

const generateSchema = z.object({
  frameworkId: zId,
  assetType: z.enum(ASSET_TYPES),
  brief: briefSchema,
  candidateCount: z.number().int().min(1).max(4),
});

/**
 * Generate/upload/select/reject/publish are all Editor capabilities per spec §16.3 ("Editor:
 * ... manage framework/output Visual Briefs, generate/upload/render visual candidates,
 * select/approve permitted visuals and change public/unlisted/hidden visibility") — none of
 * these need 'admin', unlike Visual Recipe activation (src/server/actions/admin-visual-recipes.ts).
 */
export async function generateVisualCandidatesAction(input: z.infer<typeof generateSchema>): Promise<AdminActionResult> {
  const parsed = generateSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const session = await requireRole("editor");
  try {
    await generateVisualCandidates({ ...parsed.data, actorProfileId: session.userId });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }
  revalidatePath(`/admin/visuals/${parsed.data.frameworkId}`);
  return { status: "success" };
}

export async function uploadVisualCandidateAction(formData: FormData): Promise<AdminActionResult> {
  const session = await requireRole("editor");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "invalid", message: "Choose an image to upload." };
  }

  const briefRaw = formData.get("brief");
  let brief: z.infer<typeof briefSchema>;
  try {
    brief = briefSchema.parse(JSON.parse(String(briefRaw)));
  } catch {
    return { status: "invalid", message: "Invalid Visual Brief." };
  }

  const parsed = z.object({ frameworkId: zId, assetType: z.enum(ASSET_TYPES) }).safeParse({
    frameworkId: formData.get("frameworkId"),
    assetType: formData.get("assetType"),
  });
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    await uploadVisualCandidate({
      frameworkId: parsed.data.frameworkId,
      assetType: parsed.data.assetType,
      brief,
      originalFilename: file.name,
      mimeType: file.type || "application/octet-stream",
      bytes,
      actorProfileId: session.userId,
    });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }
  revalidatePath(`/admin/visuals/${parsed.data.frameworkId}`);
  return { status: "success" };
}

const assetActionSchema = z.object({ assetId: z.uuid(), frameworkId: zId });

export async function selectVisualCandidateAction(input: z.infer<typeof assetActionSchema>): Promise<AdminActionResult> {
  const parsed = assetActionSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const session = await requireRole("editor");
  try {
    await selectVisualCandidate(parsed.data.assetId, session.userId);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }
  revalidatePath(`/admin/visuals/${parsed.data.frameworkId}`);
  return { status: "success" };
}

const rejectSchema = assetActionSchema.extend({ reason: z.string().max(500).optional() });

export async function rejectVisualCandidateAction(input: z.infer<typeof rejectSchema>): Promise<AdminActionResult> {
  const parsed = rejectSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const session = await requireRole("editor");
  try {
    await rejectVisualCandidate(parsed.data.assetId, session.userId, parsed.data.reason);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }
  revalidatePath(`/admin/visuals/${parsed.data.frameworkId}`);
  return { status: "success" };
}

const altTextSchema = assetActionSchema.extend({ altText: z.string().max(500), decorative: z.boolean() });

export async function updateVisualAltTextAction(input: z.infer<typeof altTextSchema>): Promise<AdminActionResult> {
  const parsed = altTextSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  if (!parsed.data.decorative && parsed.data.altText.trim().length === 0) {
    return { status: "invalid", message: "Alt text is required unless the image is marked decorative." };
  }
  await requireRole("editor");
  try {
    await updateVisualAltText(parsed.data.assetId, parsed.data.altText, parsed.data.decorative);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }
  revalidatePath(`/admin/visuals/${parsed.data.frameworkId}`);
  return { status: "success" };
}

/** Also used for "restore" — same underlying action on a historical asset id, see admin/visuals.ts. */
export async function publishVisualAssetAction(input: z.infer<typeof assetActionSchema>): Promise<AdminActionResult> {
  const parsed = assetActionSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const session = await requireRole("editor");
  try {
    await publishVisualAsset(parsed.data.assetId, session.userId);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }
  revalidatePath(`/admin/visuals/${parsed.data.frameworkId}`);
  revalidatePath(`/products`);
  return { status: "success" };
}

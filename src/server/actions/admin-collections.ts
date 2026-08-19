"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/dal";
import {
  addCollectionMember,
  createCollection,
  publishCollection,
  removeCollectionMember,
  reorderCollectionMembers,
  setCollectionVisibility,
  updateCollection,
  updateCollectionMember,
  type CollectionValidationResult,
} from "@/server/admin/collections";
import { zId } from "@/lib/utils/id";

export type AdminActionResult = { status: "success" } | { status: "invalid" | "error"; message: string };

const collectionFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  slug: z
    .string()
    .min(1, "Slug is required.")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers and hyphens."),
  headline: z.string().max(280).optional(),
  shortDescription: z.string().min(1, "Short description is required."),
  displayOrder: z.coerce.number().int(),
  isCore: z.boolean(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(300).optional(),
});

/**
 * Collection content editing follows the same 'editor' floor as Guide/Template/Tool content and
 * visual publishing (see admin-guides.ts, admin-template-content.ts, admin-visuals.ts) — it's an
 * editorial/navigation operation, not the "hide a live output" class of change that
 * admin-frameworks.ts/admin-products.ts reserve for 'admin'.
 */
export type CreateCollectionActionResult = { status: "success"; id: string } | { status: "invalid" | "error"; message: string };

export async function createCollectionAction(input: z.infer<typeof collectionFormSchema>): Promise<CreateCollectionActionResult> {
  const parsed = collectionFormSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const session = await requireRole("editor");
  let created: { id: string };
  try {
    created = await createCollection({
      name: parsed.data.name,
      slug: parsed.data.slug,
      headline: parsed.data.headline || null,
      shortDescription: parsed.data.shortDescription,
      displayOrder: parsed.data.displayOrder,
      isCore: parsed.data.isCore,
      seoTitle: parsed.data.seoTitle || null,
      seoDescription: parsed.data.seoDescription || null,
      actorProfileId: session.userId,
    });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }

  revalidatePath("/admin/collections");
  return { status: "success", id: created.id };
}

export async function updateCollectionAction(
  collectionId: string,
  input: z.infer<typeof collectionFormSchema>,
): Promise<AdminActionResult> {
  const parsedId = zId.safeParse(collectionId);
  const parsed = collectionFormSchema.safeParse(input);
  if (!parsedId.success || !parsed.success) {
    return { status: "invalid", message: parsed.success ? "Invalid ID." : (parsed.error.issues[0]?.message ?? "Invalid input.") };
  }

  const session = await requireRole("editor");
  try {
    await updateCollection({
      id: parsedId.data,
      name: parsed.data.name,
      slug: parsed.data.slug,
      headline: parsed.data.headline || null,
      shortDescription: parsed.data.shortDescription,
      displayOrder: parsed.data.displayOrder,
      isCore: parsed.data.isCore,
      seoTitle: parsed.data.seoTitle || null,
      seoDescription: parsed.data.seoDescription || null,
      actorProfileId: session.userId,
    });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }

  revalidatePath("/admin/collections");
  revalidatePath(`/admin/collections/${parsedId.data}`);
  return { status: "success" };
}

const changeVisibilitySchema = z.object({
  collectionId: zId,
  visibility: z.enum(["public", "unlisted", "hidden"]),
  reason: z.string().max(500).optional(),
});

/** Visibility changes require 'admin', matching changeFrameworkVisibility/changeProductVisibility. */
export async function changeCollectionVisibility(input: z.infer<typeof changeVisibilitySchema>): Promise<AdminActionResult> {
  const parsed = changeVisibilitySchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const session = await requireRole("admin");
  try {
    await setCollectionVisibility({
      collectionId: parsed.data.collectionId,
      visibility: parsed.data.visibility,
      reason: parsed.data.reason,
      actorProfileId: session.userId,
    });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }

  revalidatePath("/admin/collections");
  return { status: "success" };
}

export type PublishCollectionActionResult = AdminActionResult | { status: "validation_failed"; errors: string[] };

export async function publishCollectionAction(collectionId: string): Promise<PublishCollectionActionResult> {
  const parsedId = zId.safeParse(collectionId);
  if (!parsedId.success) return { status: "invalid", message: "Invalid ID." };

  const session = await requireRole("editor");
  let result: CollectionValidationResult;
  try {
    result = await publishCollection({ collectionId: parsedId.data, actorProfileId: session.userId });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }

  if (!result.valid) {
    return { status: "validation_failed", errors: result.errors };
  }

  revalidatePath("/admin/collections");
  revalidatePath(`/admin/collections/${parsedId.data}`);
  return { status: "success" };
}

const memberFormSchema = z.object({
  collectionId: zId,
  frameworkId: zId,
  stepLabel: z.string().min(1, "Step label is required."),
  transitionCopy: z.string().max(500).optional(),
  isRequired: z.boolean(),
});

export async function addCollectionMemberAction(
  input: z.infer<typeof memberFormSchema> & { stepOrder: number },
): Promise<AdminActionResult> {
  const parsed = memberFormSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const stepOrder = Number(input.stepOrder);
  if (!Number.isInteger(stepOrder) || stepOrder < 1) {
    return { status: "invalid", message: "Step order must be a positive integer." };
  }

  const session = await requireRole("editor");
  try {
    await addCollectionMember({
      collectionId: parsed.data.collectionId,
      frameworkId: parsed.data.frameworkId,
      stepOrder,
      stepLabel: parsed.data.stepLabel,
      transitionCopy: parsed.data.transitionCopy || null,
      isRequired: parsed.data.isRequired,
      actorProfileId: session.userId,
    });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }

  revalidatePath(`/admin/collections/${parsed.data.collectionId}`);
  return { status: "success" };
}

export async function updateCollectionMemberAction(input: z.infer<typeof memberFormSchema>): Promise<AdminActionResult> {
  const parsed = memberFormSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const session = await requireRole("editor");
  try {
    await updateCollectionMember({
      collectionId: parsed.data.collectionId,
      frameworkId: parsed.data.frameworkId,
      stepLabel: parsed.data.stepLabel,
      transitionCopy: parsed.data.transitionCopy || null,
      isRequired: parsed.data.isRequired,
      actorProfileId: session.userId,
    });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }

  revalidatePath(`/admin/collections/${parsed.data.collectionId}`);
  return { status: "success" };
}

const memberIdentitySchema = z.object({ collectionId: zId, frameworkId: zId });

export async function removeCollectionMemberAction(input: z.infer<typeof memberIdentitySchema>): Promise<AdminActionResult> {
  const parsed = memberIdentitySchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const session = await requireRole("editor");
  try {
    await removeCollectionMember({
      collectionId: parsed.data.collectionId,
      frameworkId: parsed.data.frameworkId,
      actorProfileId: session.userId,
    });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }

  revalidatePath(`/admin/collections/${parsed.data.collectionId}`);
  return { status: "success" };
}

const reorderSchema = z.object({ collectionId: zId, orderedFrameworkIds: z.array(zId).min(1) });

export async function reorderCollectionMembersAction(input: z.infer<typeof reorderSchema>): Promise<AdminActionResult> {
  const parsed = reorderSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const session = await requireRole("editor");
  try {
    await reorderCollectionMembers({
      collectionId: parsed.data.collectionId,
      orderedFrameworkIds: parsed.data.orderedFrameworkIds,
      actorProfileId: session.userId,
    });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }

  revalidatePath(`/admin/collections/${parsed.data.collectionId}`);
  return { status: "success" };
}

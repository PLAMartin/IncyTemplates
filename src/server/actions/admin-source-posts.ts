"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import GithubSlugger from "github-slugger";
import { requireRole } from "@/server/auth/dal";
import {
  addFrameworkMapping,
  createFrameworkCandidateFromSuggestion,
  removeFrameworkMapping,
  reviewSourcePostMapping,
} from "@/server/admin/source-posts";
import { zId } from "@/lib/utils/id";
import { contributionTypeSchema, mappingStatusSchema, sourceUseTypeSchema } from "@/lib/source-mapping/schema";

const sourcePostIdSchema = z.string().min(1).max(200);

export type SourcePostActionResult = { status: "success" } | { status: "invalid" | "error"; message: string };

function revalidateSourcePost(sourcePostId: string) {
  revalidatePath("/admin/source-posts");
  revalidatePath(`/admin/source-posts/review/${sourcePostId}`);
}

const reviewMappingSchema = z.object({
  sourcePostId: sourcePostIdSchema,
  assessmentId: z.uuid().nullable(),
  status: mappingStatusSchema,
  editorialUses: z.array(sourceUseTypeSchema),
  editorialNote: z.string().max(1000).optional(),
});

/** Covers Accept as suggested / Edit mapping / Mark source-only / Dismiss — all four are the
 * same underlying write (spec §23.2.5 items 2,3,5,6), just a different `status` +
 * `editorialUses` combination chosen by the caller. */
export async function reviewSourcePostMappingAction(
  input: z.infer<typeof reviewMappingSchema>,
): Promise<SourcePostActionResult> {
  const parsed = reviewMappingSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const session = await requireRole("editor");

  try {
    await reviewSourcePostMapping({ ...parsed.data, actorProfileId: session.userId });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }

  revalidateSourcePost(parsed.data.sourcePostId);
  return { status: "success" };
}

const addFrameworkMappingSchema = z.object({
  sourcePostId: sourcePostIdSchema,
  frameworkId: zId,
  sourceAssessmentId: z.uuid().nullable(),
  contributionType: contributionTypeSchema,
  outputUses: z.array(sourceUseTypeSchema).min(1),
  mappingOrigin: z.enum(["manual", "accepted_suggestion", "adjusted_suggestion"]),
  editorialNote: z.string().max(1000).optional(),
});

export async function addFrameworkMappingAction(
  input: z.infer<typeof addFrameworkMappingSchema>,
): Promise<SourcePostActionResult> {
  const parsed = addFrameworkMappingSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const session = await requireRole("editor");

  try {
    await addFrameworkMapping({ ...parsed.data, actorProfileId: session.userId });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }

  revalidateSourcePost(parsed.data.sourcePostId);
  return { status: "success" };
}

const removeFrameworkMappingSchema = z.object({
  sourcePostId: sourcePostIdSchema,
  frameworkId: zId,
});

export async function removeFrameworkMappingAction(
  input: z.infer<typeof removeFrameworkMappingSchema>,
): Promise<SourcePostActionResult> {
  const parsed = removeFrameworkMappingSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const session = await requireRole("editor");

  try {
    await removeFrameworkMapping({ ...parsed.data, actorProfileId: session.userId });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }

  revalidateSourcePost(parsed.data.sourcePostId);
  return { status: "success" };
}

const createCandidateSchema = z.object({
  sourcePostId: sourcePostIdSchema,
  sourceAssessmentId: z.uuid().nullable(),
  name: z.string().min(1).max(200),
  outcomeStatement: z.string().min(1).max(2000),
  sourceNote: z.string().min(1).max(2000),
  outputUses: z.array(sourceUseTypeSchema).min(1),
});

/**
 * Creates a `candidate`-status framework from a suggestion and links this post to it as
 * `primary_method` / `accepted_suggestion` — the explicit, separate action spec v7 §9.14 step
 * 8 requires ("must not create a published Guide, Template or Tool and must never publish
 * anything automatically"). Approval/publication remain the existing `/admin/frameworks` flow.
 */
export async function createFrameworkCandidateFromSuggestionAction(
  input: z.infer<typeof createCandidateSchema>,
): Promise<SourcePostActionResult> {
  const parsed = createCandidateSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const session = await requireRole("editor");
  const slugger = new GithubSlugger();
  const slug = slugger.slug(parsed.data.name);

  try {
    const frameworkId = await createFrameworkCandidateFromSuggestion({
      sourcePostId: parsed.data.sourcePostId,
      name: parsed.data.name,
      slug,
      outcomeStatement: parsed.data.outcomeStatement,
      sourceNote: `Created from A Bit Gamey source post "${parsed.data.sourcePostId}" via the Source Post Mapping review workspace.`,
      actorProfileId: session.userId,
    });
    await addFrameworkMapping({
      sourcePostId: parsed.data.sourcePostId,
      frameworkId,
      sourceAssessmentId: parsed.data.sourceAssessmentId,
      contributionType: "primary_method",
      outputUses: parsed.data.outputUses,
      mappingOrigin: "accepted_suggestion",
      actorProfileId: session.userId,
    });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }

  revalidateSourcePost(parsed.data.sourcePostId);
  revalidatePath("/admin/frameworks");
  return { status: "success" };
}

"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/dal";
import { setFrameworkVisibility } from "@/server/admin/frameworks";
import { zId } from "@/lib/utils/id";

const changeVisibilitySchema = z.object({
  frameworkId: zId,
  visibility: z.enum(["public", "unlisted", "hidden"]),
  reason: z.string().max(500).optional(),
});

export type ChangeFrameworkVisibilityResult = { status: "success" } | { status: "invalid" | "error"; message: string };

/**
 * Hiding a live product/framework is the kind of change spec §16.3 flags as
 * plausibly worth restricting beyond "editor" — this action requires
 * 'admin' (support/editor cannot call it), matching the DAL's role ranking.
 */
export async function changeFrameworkVisibility(
  input: z.infer<typeof changeVisibilitySchema>,
): Promise<ChangeFrameworkVisibilityResult> {
  const parsed = changeVisibilitySchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const session = await requireRole("admin");

  try {
    await setFrameworkVisibility({
      frameworkId: parsed.data.frameworkId,
      visibility: parsed.data.visibility,
      reason: parsed.data.reason,
      actorProfileId: session.userId,
    });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }

  revalidatePath("/admin/frameworks");
  return { status: "success" };
}

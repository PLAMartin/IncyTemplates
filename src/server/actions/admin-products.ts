"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/dal";
import { setProductVisibility } from "@/server/admin/products";

const changeVisibilitySchema = z.object({
  productId: z.uuid(),
  visibility: z.enum(["public", "unlisted", "hidden"]),
  reason: z.string().max(500).optional(),
});

export type ChangeProductVisibilityResult = { status: "success" } | { status: "invalid" | "error"; message: string };

/** Same 'admin'-only rule as changeFrameworkVisibility (src/server/actions/admin-frameworks.ts). */
export async function changeProductVisibility(
  input: z.infer<typeof changeVisibilitySchema>,
): Promise<ChangeProductVisibilityResult> {
  const parsed = changeVisibilitySchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const session = await requireRole("admin");

  try {
    await setProductVisibility({
      productId: parsed.data.productId,
      visibility: parsed.data.visibility,
      reason: parsed.data.reason,
      actorProfileId: session.userId,
    });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/guides");
  return { status: "success" };
}

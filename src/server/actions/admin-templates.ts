"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/dal";
import { replaceTemplateFile } from "@/server/admin/templates";
import { zId } from "@/lib/utils/id";

export type AdminActionResult = { status: "success" } | { status: "invalid" | "error"; message: string };

const FILE_ROLES = ["template", "example", "instructions", "facilitator_guide", "preview", "cover", "bonus"] as const;
const FILE_FORMATS = [
  "pdf",
  "docx",
  "xlsx",
  "pptx",
  "markdown",
  "notion",
  "miro",
  "google_docs",
  "google_sheets",
  "zip",
  "png",
  "jpg",
  "webp",
  "other",
] as const;

const metadataSchema = z.object({
  productId: zId,
  version: z.string().min(1, "Version is required."),
  releaseNotes: z.string().max(1000).optional(),
  fileRole: z.enum(FILE_ROLES),
  fileFormat: z.enum(FILE_FORMATS),
  displayName: z.string().min(1, "Display name is required."),
  isPublicPreview: z.boolean(),
});

/**
 * Template file versions are an Editor capability per spec §14 role matrix
 * ("Extend Editor/Admin capabilities to ... Template file versions ...") —
 * same 'editor' floor as the content-editing actions, not 'admin'.
 */
export async function replaceTemplateFileAction(formData: FormData): Promise<AdminActionResult> {
  const session = await requireRole("editor");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "invalid", message: "Choose a file to upload." };
  }

  const parsed = metadataSchema.safeParse({
    productId: formData.get("productId"),
    version: formData.get("version"),
    releaseNotes: formData.get("releaseNotes") || undefined,
    fileRole: formData.get("fileRole"),
    fileFormat: formData.get("fileFormat"),
    displayName: formData.get("displayName"),
    isPublicPreview: formData.get("isPublicPreview") === "true",
  });
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    await replaceTemplateFile({
      ...parsed.data,
      originalFilename: file.name,
      mimeType: file.type || "application/octet-stream",
      bytes,
      actorProfileId: session.userId,
    });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }

  revalidatePath("/admin/templates");
  return { status: "success" };
}

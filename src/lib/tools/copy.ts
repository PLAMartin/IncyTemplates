import type { ToolCopySchema } from "./types";

/**
 * Merges admin overrides over a Tool's declared defaults. Keys not present in `schema` are
 * ignored even if present in `overrides` — this is what keeps admin-editable copy limited to
 * exactly what the Tool declared as safe, regardless of what ends up stored in
 * `it_tool_copy_revisions.content_data` (defence in depth alongside the DB/RLS layer).
 */
export function resolveToolCopy(
  schema: ToolCopySchema | undefined,
  overrides: Record<string, string> | null | undefined,
): Record<string, string> {
  if (!schema) return {};
  const resolved: Record<string, string> = {};
  for (const [key, spec] of Object.entries(schema)) {
    const override = overrides?.[key];
    resolved[key] = typeof override === "string" && override.trim() !== "" ? override : spec.defaultValue;
  }
  return resolved;
}

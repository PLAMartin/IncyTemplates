import { getSupabaseAnonClient, hasSupabaseConfig } from "@/lib/supabase/anon-client";
import { findToolDefinition } from "@/lib/tools/registry";
import { resolveToolCopy } from "@/lib/tools/copy";

/**
 * Public read: the currently published `it_tool_copy_revisions` row for a `tool_key`, merged
 * over the Tool's own declared defaults. Used server-side by the Tool page
 * (`src/app/(marketing)/tools/[toolKey]/page.tsx`) so each Runner receives already-resolved
 * copy as a prop rather than fetching for itself. Not part of `CatalogueSource` — this is
 * keyed by `tool_key`/the compile-time registry, not an `it_products` row, and there's
 * nothing meaningful to model in fixtures mode (no live table to read), so it just falls back
 * to defaults-only, same reasoning as fixture-source.ts's public_visibility note.
 */
export async function getToolCopyForToolKey(toolKey: string): Promise<Record<string, string>> {
  const definition = findToolDefinition(toolKey);
  if (!definition?.copySchema) return {};

  if (!hasSupabaseConfig()) {
    return resolveToolCopy(definition.copySchema, null);
  }

  const client = getSupabaseAnonClient();
  const { data, error } = await client
    .from("it_tool_copy_revisions")
    .select("content_data")
    .eq("tool_key", toolKey)
    .not("published_at", "is", null)
    .order("revision_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return resolveToolCopy(definition.copySchema, null);
  }

  return resolveToolCopy(definition.copySchema, data.content_data as Record<string, string>);
}

import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { VisualRecipeConfig } from "@/lib/visuals/types";

export type AdminVisualRecipe = {
  id: string;
  recipeKey: string;
  version: number;
  name: string;
  status: string;
  configData: VisualRecipeConfig;
  promptTemplate: string | null;
  createdAt: string;
  approvedAt: string | null;
};

/**
 * Read-only this milestone: only one recipe (`incytemplates-v1` v1, already `approved`, see
 * docs/decisions/0046-visual-recipe-v1-palette.md) exists, so there is nothing yet to activate.
 * Creating/approving a second recipe version is real remaining scope for whenever that need
 * arises — see docs/decisions/0048-admin-visuals-workspace.md's Follow-up.
 */
export async function listVisualRecipesForAdmin(): Promise<AdminVisualRecipe[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("it_visual_recipes")
    .select("id, recipe_key, version, name, status, config_data, prompt_template, created_at, approved_at")
    .order("recipe_key", { ascending: true })
    .order("version", { ascending: false });
  if (error) throw new Error(`Failed to load visual recipes: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    recipeKey: row.recipe_key,
    version: row.version,
    name: row.name,
    status: row.status,
    configData: row.config_data,
    promptTemplate: row.prompt_template,
    createdAt: row.created_at,
    approvedAt: row.approved_at,
  }));
}

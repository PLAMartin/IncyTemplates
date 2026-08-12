import type { Metadata } from "next";
import { requireRole } from "@/server/auth/dal";
import { listVisualRecipesForAdmin } from "@/server/admin/visual-recipes";

export const metadata: Metadata = {
  title: "Visual recipes — Admin",
  robots: { index: false, follow: false },
};

/**
 * Admin/Owner only — spec §16.3: "Admin: ... Visual Recipe activation/version administration."
 * Editors still see and use the active recipe from the Visuals workspace itself (a plain staff
 * read, granted by it_visual_recipes' existing RLS policy); this page is specifically the
 * administration surface, not general visibility.
 *
 * Read-only this milestone: only one recipe exists (incytemplates-v1 v1, already approved — see
 * docs/decisions/0046-visual-recipe-v1-palette.md), so there's nothing to activate yet. Creating
 * a new draft version and approving it is real remaining scope, not built here — see
 * docs/decisions/0048-admin-visuals-workspace.md's Follow-up.
 */
export default async function AdminVisualRecipesPage() {
  await requireRole("admin");
  const recipes = await listVisualRecipesForAdmin();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink-900">Visual recipes</h1>
        <p className="mt-1 text-ink-500">
          Versioned site-wide art direction/design tokens. New versions and activation aren&apos;t manageable here yet
          — see <code className="text-xs">scripts/seed-visual-recipe.ts</code>.
        </p>
      </div>
      <div className="space-y-4">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="rounded-md border border-ink-200 bg-paper-raised p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="font-semibold text-ink-900">
                {recipe.name} <span className="text-sm font-normal text-ink-500">v{recipe.version}</span>
              </h2>
              <span className="text-xs uppercase tracking-wide text-ink-500">{recipe.status}</span>
            </div>
            <p className="mt-1 text-xs text-ink-500">
              Created {new Date(recipe.createdAt).toLocaleDateString()}
              {recipe.approvedAt ? ` · Approved ${new Date(recipe.approvedAt).toLocaleDateString()}` : ""}
            </p>
            <pre className="mt-3 overflow-x-auto rounded bg-ink-100 p-3 text-xs text-ink-900">
              {JSON.stringify(recipe.configData, null, 2)}
            </pre>
          </div>
        ))}
        {recipes.length === 0 ? <p className="text-sm text-ink-500">No visual recipes yet.</p> : null}
      </div>
    </div>
  );
}

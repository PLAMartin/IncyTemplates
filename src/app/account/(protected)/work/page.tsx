import type { Metadata } from "next";
import { NotebookPen } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

export const metadata: Metadata = {
  title: "Your work",
  robots: { index: false, follow: false },
};

type ToolRunRow = {
  id: string;
  status: string;
  title: string | null;
  started_at: string;
  product: { name: string } | null;
};

/**
 * Reads via the ordinary session-bound client, not service-role — RLS scopes this to the
 * caller's own rows (profile_id = auth.uid(), 20260813170010_it_tool_runs_rls.sql). Unlike
 * /account/library's entitlement query, this does join directly to it_products for the display
 * name: it_tool_runs has no product_name_snapshot column (spec §14.12), and Tools — unlike
 * templates — are core site features not expected to be unpublished, so the small risk of a
 * blank name after an unpublish is an accepted, documented deviation rather than a snapshot.
 */
export default async function AccountWorkPage() {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("it_tool_runs")
    .select("id, status, title, started_at, product:it_products(name)")
    .order("started_at", { ascending: false });

  const runs = (error ? [] : ((data as unknown as ToolRunRow[]) ?? [])).filter((run) => run.status !== "deleted");

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-ink-900">Your work</h1>
      {runs.length === 0 ? (
        <div className="mt-6 flex items-start gap-3 rounded-md border border-ink-200 bg-paper-raised p-6 text-sm text-ink-500">
          <NotebookPen aria-hidden className="mt-0.5 size-5 shrink-0" />
          <p>Nothing saved yet — results you save from a Tool will appear here.</p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-ink-200 rounded-md border border-ink-200 bg-paper-raised">
          {runs.map((run) => (
            <li key={run.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium text-ink-900">{run.title ?? run.product?.name ?? "Saved result"}</p>
                <p className="text-sm text-ink-500">Saved {new Date(run.started_at).toLocaleDateString()}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

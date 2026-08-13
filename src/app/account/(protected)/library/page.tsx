import type { Metadata } from "next";
import { PackageOpen } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

export const metadata: Metadata = {
  title: "Your library",
  robots: { index: false, follow: false },
};

type EntitlementRow = {
  id: string;
  status: string;
  granted_at: string;
  includes_future_updates: boolean;
  order_item: { product_name_snapshot: string; product_type_snapshot: string } | null;
};

/**
 * Reads via the ordinary session-bound client, not service-role — RLS already scopes this to
 * the caller's own rows (profile_id = auth.uid(), 20260728155524_row_level_security.sql). Joined
 * to it_order_items for the product name, never to it_products directly: that table's own
 * comment warns against it for historical display copy, and a since-unpublished product would
 * otherwise silently vanish from a live join.
 */
export default async function AccountLibraryPage() {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("it_entitlements")
    .select("id, status, granted_at, includes_future_updates, order_item:it_order_items!source_order_item_id(product_name_snapshot, product_type_snapshot)")
    .order("granted_at", { ascending: false });

  const entitlements = (error ? [] : ((data as unknown as EntitlementRow[]) ?? [])).filter((e) => e.status === "active");

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-ink-900">Your library</h1>
      {entitlements.length === 0 ? (
        <div className="mt-6 flex items-start gap-3 rounded-md border border-ink-200 bg-paper-raised p-6 text-sm text-ink-500">
          <PackageOpen aria-hidden className="mt-0.5 size-5 shrink-0" />
          <p>Nothing here yet — your purchases will appear as soon as they&apos;re confirmed.</p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-ink-200 rounded-md border border-ink-200 bg-paper-raised">
          {entitlements.map((entitlement) => (
            <li key={entitlement.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium text-ink-900">{entitlement.order_item?.product_name_snapshot ?? "Purchased item"}</p>
                <p className="text-sm text-ink-500">
                  {entitlement.order_item?.product_type_snapshot ?? "template"} · Granted{" "}
                  {new Date(entitlement.granted_at).toLocaleDateString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

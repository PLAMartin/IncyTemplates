import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";
import type { PublicVisibility } from "@/types/admin";

export type AdminProductListItem = {
  id: string;
  slug: string;
  name: string;
  product_type: "guide" | "template" | "tool" | "bundle";
  status: string;
  public_visibility: PublicVisibility;
  updated_at: string;
};

/**
 * Cross-type visibility manager (spec §10.11: "List/filter outputs by
 * family, output type, lifecycle status, public visibility... Change
 * visibility between Public, Unlisted and Hidden"), separate from each
 * output type's own content editor (Guides today, Templates/Tools to
 * follow) — this is the one place to see and change visibility across
 * every Guide/Template/Tool/Bundle at once.
 */
export async function listProductsForAdmin(): Promise<AdminProductListItem[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("it_products")
    .select("id, slug, name, product_type, status, public_visibility, updated_at")
    .order("product_type", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(`Failed to load products: ${error.message}`);
  return (data ?? []) as AdminProductListItem[];
}

export type SetProductVisibilityInput = {
  productId: string;
  visibility: PublicVisibility;
  reason?: string;
  actorProfileId: string;
};

/** Write path: service-role — see admin/frameworks.ts for why. */
export async function setProductVisibility(input: SetProductVisibilityInput): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();

  const { data: before, error: beforeError } = await supabase
    .from("it_products")
    .select("public_visibility")
    .eq("id", input.productId)
    .single();
  if (beforeError || !before) {
    throw new Error("Product not found.");
  }

  const { error: updateError } = await supabase
    .from("it_products")
    .update({
      public_visibility: input.visibility,
      visibility_note: input.reason ?? null,
      hidden_at: input.visibility === "hidden" ? new Date().toISOString() : null,
      hidden_by: input.visibility === "hidden" ? input.actorProfileId : null,
      updated_by: input.actorProfileId,
    })
    .eq("id", input.productId);
  if (updateError) {
    throw new Error(`Failed to update visibility: ${updateError.message}`);
  }

  const { error: auditError } = await supabase.rpc("it_write_audit_log", {
    p_action: "visibility_change",
    p_entity_type: "it_products",
    p_entity_id: input.productId,
    p_before_state: { public_visibility: before.public_visibility },
    p_after_state: { public_visibility: input.visibility },
    p_reason: input.reason ?? null,
    p_actor_profile_id: input.actorProfileId,
  });
  if (auditError) {
    throw new Error(`Visibility updated but audit log write failed: ${auditError.message}`);
  }
}

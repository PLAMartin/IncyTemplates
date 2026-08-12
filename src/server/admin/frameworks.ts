import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";
import type { PublicVisibility } from "@/types/admin";

export type AdminFrameworkRow = {
  id: string;
  status: string;
  public_visibility: PublicVisibility;
  name: string;
  slug: string;
  short_description: string;
  flagship: boolean;
  published_at: string | null;
  hidden_at: string | null;
  visibility_note: string | null;
  updated_at: string;
  journey_stage: { name: string; slug: string } | null;
};

/**
 * Read path: uses the session-bound (RLS-respecting) client, not
 * service-role. The "staff can read all frameworks regardless of status"
 * RLS policy (20260728155524_row_level_security.sql) already lets any
 * signed-in staff member see every row — no need to bypass RLS just to
 * read. Service-role is reserved for the write path below, per this repo's
 * "privileged writes only, via server-side service-role" convention.
 */
export async function listFrameworksForAdmin(): Promise<AdminFrameworkRow[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("it_frameworks")
    .select(
      "id, status, public_visibility, name, slug, short_description, flagship, published_at, hidden_at, visibility_note, updated_at, journey_stage:it_stages(name, slug)",
    )
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to load frameworks: ${error.message}`);
  }
  return (data ?? []) as unknown as AdminFrameworkRow[];
}

export type SetFrameworkVisibilityInput = {
  frameworkId: string;
  visibility: PublicVisibility;
  reason?: string;
  actorProfileId: string;
};

/**
 * Write path: service-role client (bypasses RLS) — there is no staff write
 * RLS policy on it_frameworks by design (see row_level_security.sql's
 * header comment). Callers must have already run `requireRole()` before
 * reaching this function; it does not check authorization itself.
 */
export async function setFrameworkVisibility(input: SetFrameworkVisibilityInput): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();

  const { data: before, error: beforeError } = await supabase
    .from("it_frameworks")
    .select("public_visibility")
    .eq("id", input.frameworkId)
    .single();

  if (beforeError || !before) {
    throw new Error("Framework not found.");
  }

  const { error: updateError } = await supabase
    .from("it_frameworks")
    .update({
      public_visibility: input.visibility,
      visibility_note: input.reason ?? null,
      hidden_at: input.visibility === "hidden" ? new Date().toISOString() : null,
      hidden_by: input.visibility === "hidden" ? input.actorProfileId : null,
      updated_by: input.actorProfileId,
    })
    .eq("id", input.frameworkId);

  if (updateError) {
    throw new Error(`Failed to update visibility: ${updateError.message}`);
  }

  const { error: auditError } = await supabase.rpc("it_write_audit_log", {
    p_action: "visibility_change",
    p_entity_type: "it_frameworks",
    p_entity_id: input.frameworkId,
    p_before_state: { public_visibility: before.public_visibility },
    p_after_state: { public_visibility: input.visibility },
    p_reason: input.reason ?? null,
    p_actor_profile_id: input.actorProfileId,
  });

  if (auditError) {
    throw new Error(`Visibility updated but audit log write failed: ${auditError.message}`);
  }
}

import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

export type AdminAuditLogEntry = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  before_state: unknown;
  after_state: unknown;
  reason: string | null;
  created_at: string;
  actor: { email: string | null } | null;
};

/** "staff can read audit log" RLS policy uses is_staff() — every staff role, not just admin+. */
export async function listAuditLogForAdmin(): Promise<AdminAuditLogEntry[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("it_audit_log")
    .select("id, action, entity_type, entity_id, before_state, after_state, reason, created_at, actor:it_profiles(email)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(`Failed to load audit log: ${error.message}`);
  return (data ?? []) as unknown as AdminAuditLogEntry[];
}

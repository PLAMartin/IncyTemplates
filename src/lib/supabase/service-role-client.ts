import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { clientEnv } from "@/lib/env/client";
import { serverEnv } from "@/lib/env/server";

/**
 * Service-role Supabase client factory. Bypasses RLS entirely — never import
 * this from browser/client code or any code reachable from a request without
 * its own authorization check first. Intended for server-only privileged
 * paths (seed scripts today; the free-download signed-URL route later),
 * never the read-only catalogue source or waitlist writes, which use
 * `src/lib/supabase/anon-client.ts` instead.
 */
export function hasServiceRoleConfig(): boolean {
  return Boolean(clientEnv.NEXT_PUBLIC_SUPABASE_URL && serverEnv.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseServiceRoleClient(): SupabaseClient {
  if (!hasServiceRoleConfig()) {
    throw new Error(
      "getSupabaseServiceRoleClient() called without NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY set.",
    );
  }
  return createClient(clientEnv.NEXT_PUBLIC_SUPABASE_URL!, serverEnv.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

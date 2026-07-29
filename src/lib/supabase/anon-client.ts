import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { clientEnv } from "@/lib/env/client";

/**
 * Shared anon-key Supabase client factory. Anon key only (spec §16.4 — the
 * service-role key must never be used here); used by both the read-only
 * catalogue source (`src/server/queries/supabase-source.ts`) and the
 * waitlist write path (`src/server/actions/waitlist.ts`), which relies on
 * the public INSERT-only RLS policy on `it_waitlist_signups` rather than
 * any elevated privilege.
 */
export function hasSupabaseConfig(): boolean {
  return Boolean(clientEnv.NEXT_PUBLIC_SUPABASE_URL && clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabaseAnonClient(): SupabaseClient {
  if (!hasSupabaseConfig()) {
    throw new Error(
      "getSupabaseAnonClient() called without NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY set.",
    );
  }
  return createClient(clientEnv.NEXT_PUBLIC_SUPABASE_URL!, clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

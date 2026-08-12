"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { clientEnv } from "@/lib/env/client";

/**
 * Browser-side Supabase client for auth state that must live in the tab
 * (magic-link sign-in, sign-out). Anon key only. Server Components/Actions
 * should use `server-client.ts` instead — this one has no access to
 * `next/headers` and can't be used outside a Client Component.
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (!clientEnv.NEXT_PUBLIC_SUPABASE_URL || !clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      "getSupabaseBrowserClient() called without NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY set.",
    );
  }
  return createBrowserClient(clientEnv.NEXT_PUBLIC_SUPABASE_URL, clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { clientEnv } from "@/lib/env/client";

/**
 * Cookie-bound, RLS-respecting Supabase client for Server Components/Actions/
 * Route Handlers. This is the *only* client that should ever read the
 * signed-in user's own session/profile — never the service-role client (see
 * `service-role-client.ts`), which bypasses RLS entirely and has no notion
 * of "who is asking". Used by `src/server/auth/dal.ts`; nowhere else should
 * need it directly.
 *
 * Setting cookies from a plain Server Component render throws (Next.js only
 * allows cookie writes from Server Actions/Route Handlers/`proxy.ts`) — the
 * try/catch below matches the standard `@supabase/ssr` App Router pattern:
 * session-refresh cookies written here are best-effort, and `proxy.ts` is
 * the backstop that actually keeps the session cookie alive across requests.
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient> {
  if (!clientEnv.NEXT_PUBLIC_SUPABASE_URL || !clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      "getSupabaseServerClient() called without NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY set.",
    );
  }

  const cookieStore = await cookies();

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      try {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      } catch {
        // Called from a Server Component render — proxy.ts refreshes the
        // session cookie on the next navigation instead.
      }
    },
  };

  return createServerClient(clientEnv.NEXT_PUBLIC_SUPABASE_URL, clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: cookieMethods,
  });
}

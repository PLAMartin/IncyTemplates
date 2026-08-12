"use client";

import { useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

function safeNextPath(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/admin";
}

/**
 * Companion to /auth/callback/route.ts, for the one case a server Route Handler structurally
 * cannot handle: URL fragments (`#access_token=...`) are never sent in an HTTP request, so a
 * server-side route can't see them at all — only client-side JS reading `window.location.hash`
 * can. `/auth/callback` covers the real production sign-in path (PKCE, `?code=`, set up by
 * `signInWithOtp` running in a Server Action — see src/server/actions/auth.ts). This page covers
 * links that were never PKCE-registered in the first place, which is inherent to
 * `supabase.auth.admin.generateLink()`: called via the admin API with no browser-side
 * code_challenge to pair with, so Supabase can only respond with implicit-style fragment tokens.
 *
 * That's exactly the technique `tests/e2e/admin-auth.spec.ts`'s own top comment named as the
 * missing piece for an authenticated admin e2e session — this page is what makes it usable:
 * point admin.generateLink()'s redirectTo at this path instead of /auth/callback.
 *
 * getSupabaseBrowserClient() persists via cookies, not localStorage (see browser-client.ts), so
 * setSession() here makes the session visible to subsequent server-rendered requests too — a
 * full navigation (not a client-side route push) after setSession ensures the server actually
 * re-reads the new cookie rather than serving an already-rendered RSC tree.
 */
export default function AuthCallbackImplicitPage() {
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    const hashError = hash.get("error_description") ?? hash.get("error");

    if (hashError || !accessToken || !refreshToken) {
      window.location.replace("/sign-in?error=link-invalid-or-expired");
      return;
    }

    const next = safeNextPath(new URLSearchParams(window.location.search).get("next"));
    getSupabaseBrowserClient()
      .auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error: sessionError }) => {
        window.location.replace(sessionError ? "/sign-in?error=link-invalid-or-expired" : next);
      });
  }, []);

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <p role="status" className="text-ink-700">
        Signing you in…
      </p>
    </div>
  );
}

import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { ANONYMOUS_SESSION_COOKIE } from "@/server/session/anonymous-session";

export const runtime = "nodejs";

function safeNextPath(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/admin";
}

/**
 * Exchanges the magic-link `code` for a session, writing the session cookie
 * via the cookie-bound server client (Route Handlers can set cookies,
 * unlike a plain Server Component render — see server-client.ts). Redirects
 * to `next` (validated same-origin) or `/admin` on success, `/sign-in` with
 * an error flag on failure.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Best-effort account linking (spec §18.2): links any unlinked it_customers/
      // it_entitlements rows matching this profile's own email. Idempotent and safe to call on
      // every sign-in, not just the first — never blocks the redirect on failure.
      const { error: linkError } = await supabase.rpc("it_link_customer_to_profile");
      if (linkError) {
        console.error("Customer/profile linking failed:", linkError.message);
      }

      // Best-effort: claim any Tool runs saved anonymously before sign-in (spec §14.12).
      // Idempotent and safe to call on every sign-in — never blocks the redirect on failure.
      const anonymousSessionId = (await cookies()).get(ANONYMOUS_SESSION_COOKIE)?.value;
      if (anonymousSessionId) {
        const { error: claimError } = await supabase.rpc("it_claim_anonymous_tool_runs", {
          p_anonymous_session_id: anonymousSessionId,
        });
        if (claimError) {
          console.error("Anonymous tool run claim failed:", claimError.message);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const errorUrl = new URL("/sign-in", origin);
  errorUrl.searchParams.set("error", "link-invalid-or-expired");
  return NextResponse.redirect(errorUrl);
}

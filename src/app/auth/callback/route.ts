import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

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
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const errorUrl = new URL("/sign-in", origin);
  errorUrl.searchParams.set("error", "link-invalid-or-expired");
  return NextResponse.redirect(errorUrl);
}

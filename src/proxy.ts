import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { clientEnv } from "@/lib/env/client";

/**
 * Optimistic `/admin/**` gate. This repo's vendored Next.js docs rename the
 * `middleware.ts` file convention to `proxy.ts` (breaking change from the
 * Next.js this was trained on — see AGENTS.md) — this file is that renamed
 * convention, not a re-implementation of the old one.
 *
 * This only checks for a *signed-in* user (redirects to `/sign-in` if not)
 * and refreshes the session cookie on every request, per the standard
 * `@supabase/ssr` pattern. It does not check the user's `it_profiles.role` —
 * that requires a database read, which optimistic/proxy-layer checks should
 * avoid (this runs on every request, including prefetches). The real,
 * secure role check happens server-side in `src/server/auth/dal.ts`
 * (`requireRole`), called from each admin page/layout/Server Action —
 * this proxy is a fast reject for "not signed in at all", not the security
 * boundary itself.
 */
export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!clientEnv.NEXT_PUBLIC_SUPABASE_URL || !clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(clientEnv.NEXT_PUBLIC_SUPABASE_URL, clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl = new URL("/sign-in", request.url);
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};

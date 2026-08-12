"use server";

import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { hasSupabaseConfig } from "@/lib/supabase/anon-client";
import { site } from "@/config/site";

/**
 * Magic-link sign-in request. No self-serve sign-up: `signInWithOtp`'s
 * `shouldCreateUser: false` means this only ever sends a link to an email
 * that already has an `auth.users` row — accounts are provisioned directly
 * in Supabase (staff only, for now; customer self-signup is still out of
 * scope). Mirrors `src/server/actions/waitlist.ts`'s
 * Zod-validate/discriminated-result/no-fabricated-success conventions.
 */

const requestMagicLinkSchema = z.object({
  email: z.email("Enter a valid email address."),
  redirectTo: z.string().optional(),
});

export type RequestMagicLinkInput = {
  email: string;
  redirectTo?: string;
};

export type RequestMagicLinkResult =
  | { status: "success" }
  | { status: "invalid"; message: string }
  | { status: "not-connected"; message: string }
  | { status: "error"; message: string };

function safeRedirectPath(path: string | undefined): string {
  // Only ever forward a same-origin, absolute path — never let an open
  // redirect target reach the emailRedirectTo URL.
  if (path && path.startsWith("/") && !path.startsWith("//")) {
    return path;
  }
  return "/admin";
}

export async function requestMagicLink(input: RequestMagicLinkInput): Promise<RequestMagicLinkResult> {
  const parsed = requestMagicLinkSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { status: "invalid", message: firstIssue?.message ?? "Please check the form and try again." };
  }

  if (!hasSupabaseConfig()) {
    return {
      status: "not-connected",
      message: "Sign-in isn't connected yet in this environment (no Supabase project configured).",
    };
  }

  try {
    const supabase = await getSupabaseServerClient();
    const next = safeRedirectPath(parsed.data.redirectTo);
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${site.url}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      return {
        status: "error",
        message: "We couldn't send a sign-in link. Check the email address and try again.",
      };
    }
    return { status: "success" };
  } catch {
    return { status: "error", message: "Something went wrong sending the sign-in link. Please try again." };
  }
}

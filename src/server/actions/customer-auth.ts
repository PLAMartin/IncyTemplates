"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { hasSupabaseConfig } from "@/lib/supabase/anon-client";
import { site } from "@/config/site";

/**
 * Customer-facing magic-link sign-in — the counterpart to
 * src/server/actions/auth.ts's requestMagicLink, which is deliberately staff-only
 * (shouldCreateUser: false). Genuinely reuses the same conventions (Zod-validate/
 * discriminated-result), differing only in shouldCreateUser and the default redirect: any
 * email can request a link here, and a brand-new auth.users row lands as
 * it_profiles.role = 'customer' automatically via the handle_new_auth_user() trigger — no
 * special-casing needed on this side.
 */

const requestCustomerMagicLinkSchema = z.object({
  email: z.email("Enter a valid email address."),
  redirectTo: z.string().optional(),
});

export type RequestCustomerMagicLinkInput = {
  email: string;
  redirectTo?: string;
};

export type RequestCustomerMagicLinkResult =
  | { status: "success" }
  | { status: "invalid"; message: string }
  | { status: "not-connected"; message: string }
  | { status: "error"; message: string };

function safeRedirectPath(path: string | undefined): string {
  // Only ever forward a same-origin, absolute path — never let an open redirect target reach
  // the emailRedirectTo URL.
  if (path && path.startsWith("/") && !path.startsWith("//")) {
    return path;
  }
  return "/account";
}

export async function requestCustomerMagicLink(input: RequestCustomerMagicLinkInput): Promise<RequestCustomerMagicLinkResult> {
  const parsed = requestCustomerMagicLinkSchema.safeParse(input);
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
        shouldCreateUser: true,
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

export async function signOutCustomer(): Promise<void> {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

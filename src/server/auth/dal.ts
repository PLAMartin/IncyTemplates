import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

/**
 * Data Access Layer for admin/staff auth — the single place that turns "is
 * there a valid session cookie" into "is this user allowed to do X". Per the
 * vendored Next.js auth guide's recommended pattern
 * (node_modules/next/dist/docs/01-app/02-guides/authentication.md), this is
 * the *secure* check: it reads `it_profiles.role` from the database via the
 * session-bound client (relies on the existing "customers can read own
 * profile" RLS policy, 20260728155524_row_level_security.sql:254), unlike
 * `src/proxy.ts`'s optimistic cookie-presence check.
 */

export const STAFF_ROLES = ["support", "editor", "admin", "owner"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

const ROLE_RANK: Record<StaffRole, number> = {
  support: 1,
  editor: 2,
  admin: 3,
  owner: 4,
};

export type StaffSession = {
  userId: string;
  email: string | null;
  role: StaffRole;
};

function isStaffRole(role: string): role is StaffRole {
  return (STAFF_ROLES as readonly string[]).includes(role);
}

/**
 * Reads the current session and staff role, if any. Returns `null` for a
 * signed-out visitor *or* a signed-in customer with no staff role — callers
 * that need to distinguish those two cases should call
 * `getSupabaseServerClient().auth.getUser()` directly instead.
 *
 * Wrapped in React's `cache()` so multiple components/Server Actions in the
 * same render only pay for one session + one profile lookup.
 */
export const verifyStaffSession = cache(async (): Promise<StaffSession | null> => {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase.from("it_profiles").select("role").eq("id", user.id).single();

  if (!profile || !isStaffRole(profile.role)) {
    return null;
  }

  return { userId: user.id, email: user.email ?? null, role: profile.role };
});

/** Redirects to `/sign-in` if there is no signed-in staff member at all. */
export async function requireStaffSession(): Promise<StaffSession> {
  const session = await verifyStaffSession();
  if (!session) {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // Distinguish "signed in but not staff" from "not signed in at all" so
    // the sign-in page doesn't imply a fresh link will fix it.
    redirect(user ? "/sign-in?error=not-staff" : "/sign-in");
  }
  return session;
}

/**
 * Redirects to `/sign-in` if signed out, or to `/admin` with an error flag
 * if signed in but below `minimum` role. Role rank: support < editor <
 * admin < owner (matches `is_staff()`/`is_admin()` in
 * 20260728155522_functions_and_triggers.sql).
 */
export async function requireRole(minimum: StaffRole): Promise<StaffSession> {
  const session = await requireStaffSession();
  if (ROLE_RANK[session.role] < ROLE_RANK[minimum]) {
    redirect("/admin?error=insufficient-role");
  }
  return session;
}

/**
 * Some capabilities aren't a clean linear threshold — e.g. the it_orders RLS
 * policy ("support and admin staff can read all orders",
 * 20260728155524_row_level_security.sql:304) grants support+admin+owner but
 * explicitly *not* editor, which `requireRole('support')` would incorrectly
 * allow (editor outranks support in `ROLE_RANK`). Use this instead whenever
 * the allowed set doesn't collapse to "at least X".
 */
export async function requireAnyRole(allowed: StaffRole[]): Promise<StaffSession> {
  const session = await requireStaffSession();
  if (!allowed.includes(session.role)) {
    redirect("/admin?error=insufficient-role");
  }
  return session;
}

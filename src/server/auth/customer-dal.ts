import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

/**
 * Data Access Layer for the customer-facing /account area — parallel to dal.ts's staff DAL, not
 * a modification of it. Deliberately role-agnostic: any signed-in user (customer or staff) can
 * use /account to see whatever purchases are linked to their own profile. it_profiles.role is
 * irrelevant here — unlike dal.ts, there is no "is this the right kind of account" check, only
 * "is anyone signed in at all".
 */

export type CustomerSession = {
  userId: string;
  email: string | null;
};

/** Wrapped in React's cache() so multiple components/Server Actions in the same render share one lookup. */
export const verifyCustomerSession = cache(async (): Promise<CustomerSession | null> => {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  return { userId: user.id, email: user.email ?? null };
});

/** Redirects to /account/sign-in if there is no signed-in user at all. */
export async function requireCustomerSession(redirectPath = "/account"): Promise<CustomerSession> {
  const session = await verifyCustomerSession();
  if (!session) {
    redirect(`/account/sign-in?redirectTo=${encodeURIComponent(redirectPath)}`);
  }
  return session;
}

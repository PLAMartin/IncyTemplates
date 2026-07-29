"use server";

import { z } from "zod";
import { getSupabaseAnonClient, hasSupabaseConfig } from "@/lib/supabase/anon-client";

/**
 * Waitlist capture — the one write path a public visitor has this phase
 * (build plan "Decisions locked in": checkout/downloads aren't built yet,
 * so product/bundle pages show a waitlist CTA instead of a disabled
 * button). Writes to `it_waitlist_signups`, which has a public INSERT-only
 * RLS policy and no public SELECT — this action never reads the table back.
 */

const waitlistInputSchema = z.object({
  productId: z.string().min(1, "Missing product."),
  email: z.email("Enter a valid email address."),
  source: z.string().optional(),
});

export type WaitlistSignupInput = {
  productId: string;
  email: string;
  source?: string;
};

export type WaitlistSignupResult =
  | { status: "success" }
  | { status: "invalid"; message: string }
  | { status: "not-connected"; message: string }
  | { status: "error"; message: string };

export async function submitWaitlistSignup(input: WaitlistSignupInput): Promise<WaitlistSignupResult> {
  const parsed = waitlistInputSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { status: "invalid", message: firstIssue?.message ?? "Please check the form and try again." };
  }

  if (!hasSupabaseConfig()) {
    // Honest failure state, not a faked success: there is genuinely nowhere
    // to write this signup in fixtures mode. See build plan / spec §43.3
    // ("do not fabricate ... avoid placeholder security" applies equally to
    // avoiding placeholder success states).
    return {
      status: "not-connected",
      message:
        "The waitlist isn't connected yet in this environment (no Supabase project configured), so we couldn't save your email.",
    };
  }

  try {
    const client = getSupabaseAnonClient();
    const { error } = await client.from("it_waitlist_signups").insert({
      product_id: parsed.data.productId,
      email: parsed.data.email.toLowerCase().trim(),
      source: parsed.data.source ?? null,
    });
    if (error) {
      return { status: "error", message: "Something went wrong saving your email. Please try again." };
    }
    return { status: "success" };
  } catch {
    return { status: "error", message: "Something went wrong saving your email. Please try again." };
  }
}

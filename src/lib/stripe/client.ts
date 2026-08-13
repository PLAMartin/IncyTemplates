import "server-only";
import Stripe from "stripe";
import { serverEnv } from "@/lib/env/server";

/**
 * Stripe client factory. Server-only guard+factory pattern, same shape as
 * src/lib/supabase/service-role-client.ts and src/lib/openai/client.ts.
 * Never import this from browser/client code.
 */
export function hasStripeConfig(): boolean {
  return Boolean(serverEnv.STRIPE_SECRET_KEY);
}

export function getStripeClient(): Stripe {
  if (!hasStripeConfig()) {
    throw new Error("getStripeClient() called without STRIPE_SECRET_KEY set.");
  }
  return new Stripe(serverEnv.STRIPE_SECRET_KEY!);
}

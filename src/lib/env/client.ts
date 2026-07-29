import { z } from "zod";

/**
 * NEXT_PUBLIC_* vars only. All optional at this build phase (spec §2.7's
 * fixtures-first approach — see src/server/queries) so the app can build
 * and run with zero cloud accounts configured. Never add a server-only
 * secret here: anything in this schema ends up in the client bundle.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
});

function parseClientEnv() {
  const result = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  });

  if (!result.success) {
    throw new Error(
      `Invalid client environment variables:\n${JSON.stringify(z.treeifyError(result.error), null, 2)}`,
    );
  }

  return result.data;
}

export const clientEnv = parseClientEnv();

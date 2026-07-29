import { z } from "zod";

/**
 * Server-only environment. Every cloud-service var is `.optional()` on
 * purpose for this build phase: no Supabase/Stripe/Resend/Sentry/GA project
 * exists yet, and the app must still build, run and pass CI. Code that
 * needs one of these must check for its presence itself (see
 * src/server/queries for the Supabase/fixtures split) rather than this
 * schema forcing it to exist.
 */
const serverEnvSchema = z.object({
  APP_ENV: z.enum(["development", "preview", "production"]).default("development"),
  CONTENT_SOURCE: z.enum(["fixtures", "supabase"]).optional(),

  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM_ORDERS: z.email().optional(),
  EMAIL_FROM_SUPPORT: z.email().optional(),
  SUPPORT_EMAIL: z.email().optional(),

  RATE_LIMIT_SECRET: z.string().optional(),
  DOWNLOAD_HASH_SECRET: z.string().optional(),

  SENTRY_DSN: z.url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  COMPANY_LEGAL_NAME: z.string().optional(),
  COMPANY_NUMBER: z.string().optional(),
  COMPANY_REGISTERED_ADDRESS: z.string().optional(),
  DEFAULT_CURRENCY: z.string().length(3).optional(),
});

function parseServerEnv() {
  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    throw new Error(
      `Invalid server environment variables:\n${JSON.stringify(z.treeifyError(result.error), null, 2)}`,
    );
  }

  return result.data;
}

export const serverEnv = parseServerEnv();

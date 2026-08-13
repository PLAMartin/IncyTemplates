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

  // Visual generation (spec v6 §34). All defaulted rather than left bare-optional: unlike the
  // vars above, these have safe zero-config behaviour (provider "test", i.e. the existing
  // placeholder-SVG provider) rather than "feature simply unavailable until configured". This
  // is the first `true`/`false` string env var in this schema -- no native z.boolean() here
  // since process.env values are always strings.
  VISUAL_GENERATION_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  VISUAL_GENERATION_PROVIDER: z.enum(["test", "openai"]).default("test"),
  VISUAL_GENERATION_MAX_CANDIDATES: z.coerce.number().int().min(1).max(4).default(4),
  VISUAL_GENERATION_MONTHLY_BUDGET_MINOR: z.coerce.number().int().min(0).optional(),
  VISUAL_GENERATION_BUDGET_CURRENCY: z.string().length(3).default("USD"),
  VISUAL_GENERATION_TIMEOUT_MS: z.coerce.number().int().min(1000).default(90000),
  VISUAL_GENERATION_MAX_RETRIES: z.coerce.number().int().min(0).max(5).default(2),

  // OpenAI visual provider (server-only; never NEXT_PUBLIC_). OPENAI_API_KEY stays plain
  // `.optional()` -- whether it's *required* depends on VISUAL_GENERATION_PROVIDER, a
  // cross-field rule enforced in src/lib/visuals/providers/index.ts rather than here, since
  // serverEnv is parsed once at module load and imported broadly (including by code with
  // nothing to do with visuals); a misconfigured visuals-only var must not crash app boot.
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_PROJECT_ID: z.string().optional(),
  OPENAI_IMAGE_MODEL: z.enum(["gpt-image-2", "gpt-image-1"]).default("gpt-image-2"),
  OPENAI_IMAGE_MODEL_SNAPSHOT: z.string().optional(),
  OPENAI_IMAGE_QUALITY_PROFILE: z.enum(["draft", "standard", "high"]).default("standard"),
  OPENAI_IMAGE_OUTPUT_PROFILE: z.enum(["family_landscape", "square", "portrait"]).default("family_landscape"),
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

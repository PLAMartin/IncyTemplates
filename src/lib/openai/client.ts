import "server-only";
import OpenAI from "openai";
import { serverEnv } from "@/lib/env/server";

/**
 * OpenAI client factory (spec v6 §12.7: "Read OPENAI_API_KEY ... only on the server"). First
 * third-party outbound SDK wrapper in this repo -- shaped like
 * src/lib/supabase/service-role-client.ts's guard+factory pattern (a boolean config check plus
 * a factory that throws rather than silently returning an unusable client). Never import this
 * from browser/client code; `import "server-only"` enforces that at build time.
 */
export function hasOpenAiConfig(): boolean {
  return Boolean(serverEnv.OPENAI_API_KEY);
}

export function getOpenAiClient(): OpenAI {
  if (!hasOpenAiConfig()) {
    throw new Error("getOpenAiClient() called without OPENAI_API_KEY set.");
  }
  return new OpenAI({
    apiKey: serverEnv.OPENAI_API_KEY!,
    project: serverEnv.OPENAI_PROJECT_ID,
  });
}

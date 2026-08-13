import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { clientEnv } from "@/lib/env/client";
import { getSupabaseServiceRoleClient, hasServiceRoleConfig } from "@/lib/supabase/service-role-client";
import { errorResponse } from "@/server/downloads/errors";
import { saveToolRun } from "@/server/tools/save-tool-run";
import { verifyCustomerSession } from "@/server/auth/customer-dal";
import { ANONYMOUS_SESSION_COOKIE, ANONYMOUS_SESSION_MAX_AGE_SECONDS, getAnonymousSessionId } from "@/server/session/anonymous-session";

export const runtime = "nodejs";

const saveRunRequestSchema = z.object({ input: z.unknown(), result: z.unknown() });

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // not all same-origin requests send Origin; this is defense-in-depth, not the primary control
  const allowed = clientEnv.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
  return origin === allowed;
}

/**
 * Saves a completed Tool run (spec §14.12). Anonymous visitors can save without signing in
 * first — ownership is keyed by the it_anon_session cookie and later claimed on sign-in via
 * it_claim_anonymous_tool_runs() (src/app/auth/callback/route.ts), the same deferred-ownership
 * shape as the free-download flow.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ toolKey: string }> }) {
  if (!isSameOrigin(request)) {
    return errorResponse("ORIGIN_REJECTED", "This request could not be verified.", 403);
  }

  if (!hasServiceRoleConfig()) {
    return errorResponse("SERVICE_UNAVAILABLE", "Saving isn't available in this environment.", 503);
  }

  const { toolKey } = await params;

  const body = await request.json().catch(() => null);
  const parsed = saveRunRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "The request was invalid.", 400);
  }

  const session = await verifyCustomerSession();
  const anonymous = session ? null : await getAnonymousSessionId();

  const supabase = getSupabaseServiceRoleClient();
  const result = await saveToolRun(supabase, {
    toolKey,
    input: parsed.data.input,
    result: parsed.data.result,
    owner: session ? { profileId: session.userId } : { anonymousSessionId: anonymous!.sessionId },
  });

  if (!result.ok) {
    if (result.reason === "tool_not_found" || result.reason === "product_not_found") {
      return errorResponse("TOOL_NOT_AVAILABLE", "This tool could not be found.", 404);
    }
    if (result.reason === "invalid_input" || result.reason === "invalid_result") {
      return errorResponse("VALIDATION_ERROR", "The request was invalid.", 400);
    }
    return errorResponse("INTERNAL_ERROR", "Something went wrong. Please try again.", 500);
  }

  const response = NextResponse.json({ id: result.id });

  if (anonymous?.isNew) {
    response.cookies.set(ANONYMOUS_SESSION_COOKIE, anonymous.sessionId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: ANONYMOUS_SESSION_MAX_AGE_SECONDS,
      path: "/",
    });
  }

  return response;
}

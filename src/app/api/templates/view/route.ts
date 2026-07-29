import { NextResponse, type NextRequest } from "next/server";
import { clientEnv } from "@/lib/env/client";
import { serverEnv } from "@/lib/env/server";
import { getSupabaseServiceRoleClient, hasServiceRoleConfig } from "@/lib/supabase/service-role-client";
import { errorResponse } from "@/server/downloads/errors";
import { hashValue } from "@/server/downloads/hash";
import { checkRateLimit } from "@/server/downloads/rate-limit";
import { resolveFreeTemplateFile } from "@/server/downloads/resolve-free-template-file";
import { downloadRequestSchema } from "@/server/downloads/schema";
import { ANONYMOUS_SESSION_COOKIE, ANONYMOUS_SESSION_MAX_AGE_SECONDS, getAnonymousSessionId } from "@/server/downloads/session";
import { mintViewGrant } from "@/server/downloads/view-grant";

export const runtime = "nodejs";

const VIEW_GRANT_TTL_SECONDS = 60 * 60;

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // not all same-origin requests send Origin; this is defense-in-depth, not the primary control
  const allowed = clientEnv.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
  return origin === allowed;
}

function clientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  return request.headers.get("x-real-ip");
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return errorResponse("ORIGIN_REJECTED", "This request could not be verified.", 403);
  }

  if (!hasServiceRoleConfig()) {
    return errorResponse("SERVICE_UNAVAILABLE", "Viewing templates isn't available in this environment.", 503);
  }

  // Unlike the IP hash below, the view grant's signature IS the access
  // control — it must not be minted unsigned, so fail closed here rather
  // than letting mintViewGrant() throw deeper in the handler.
  if (!serverEnv.DOWNLOAD_HASH_SECRET) {
    return errorResponse("SERVICE_UNAVAILABLE", "Viewing templates isn't available in this environment.", 503);
  }

  const body = await request.json().catch(() => null);
  const parsed = downloadRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "The request was invalid.", 400);
  }
  const { productId, fileId, email, marketingConsent, consentTextVersion, source } = parsed.data;

  const supabase = getSupabaseServiceRoleClient();
  const { sessionId, isNew: isNewSession } = await getAnonymousSessionId();

  const ip = clientIp(request);
  const ipHash = ip ? hashValue(serverEnv.DOWNLOAD_HASH_SECRET, ip) : null;

  const { allowed } = await checkRateLimit(supabase, { ipHash, sessionId });
  if (!allowed) {
    return errorResponse("RATE_LIMITED", "Too many requests. Please try again shortly.", 429);
  }

  const resolved = await resolveFreeTemplateFile(supabase, { productId, fileId });
  if (!resolved.ok) {
    return errorResponse("PRODUCT_NOT_AVAILABLE", "This template is not currently available to view.", 404);
  }

  const viewSource = source ? `${source}-view` : "view";

  const { error: requestError } = await supabase.from("it_free_download_requests").insert({
    product_id: productId,
    email: email ?? null,
    marketing_consent: marketingConsent,
    consent_text_version: consentTextVersion ?? null,
    source: viewSource,
    anonymous_session_id: sessionId,
  });

  if (requestError) {
    console.error("Failed to record free view request:", requestError.message);
    return errorResponse("INTERNAL_ERROR", "Something went wrong. Please try again.", 500);
  }

  const emailHash = email ? hashValue(serverEnv.DOWNLOAD_HASH_SECRET, email.toLowerCase()) : null;

  const { error: eventError } = await supabase.from("it_download_events").insert({
    file_id: fileId,
    product_id: productId,
    anonymous_session_id: sessionId,
    email_hash: emailHash,
    source: viewSource,
    user_agent: request.headers.get("user-agent"),
    ip_hash: ipHash,
  });

  if (eventError) {
    console.error("Failed to record view event:", eventError.message);
    return errorResponse("INTERNAL_ERROR", "Something went wrong. Please try again.", 500);
  }

  const grant = mintViewGrant(serverEnv.DOWNLOAD_HASH_SECRET, { productId, fileId }, VIEW_GRANT_TTL_SECONDS);

  const response = NextResponse.json({ ok: true });

  response.cookies.set(`it_view_grant_${productId}`, grant, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: VIEW_GRANT_TTL_SECONDS,
    path: "/",
  });

  if (isNewSession) {
    response.cookies.set(ANONYMOUS_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: ANONYMOUS_SESSION_MAX_AGE_SECONDS,
      path: "/",
    });
  }

  return response;
}

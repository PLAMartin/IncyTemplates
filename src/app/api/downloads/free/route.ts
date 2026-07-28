import { NextResponse, type NextRequest } from "next/server";
import { clientEnv } from "@/lib/env/client";
import { serverEnv } from "@/lib/env/server";
import { getSupabaseServiceRoleClient, hasServiceRoleConfig } from "@/lib/supabase/service-role-client";
import { errorResponse } from "@/server/downloads/errors";
import { hashValue } from "@/server/downloads/hash";
import { checkRateLimit } from "@/server/downloads/rate-limit";
import { downloadRequestSchema } from "@/server/downloads/schema";
import { ANONYMOUS_SESSION_COOKIE, ANONYMOUS_SESSION_MAX_AGE_SECONDS, getAnonymousSessionId } from "@/server/downloads/session";

export const runtime = "nodejs";

const BUCKET = "it-free-files";
const SIGNED_URL_TTL_SECONDS = 300;

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
    return errorResponse(
      "SERVICE_UNAVAILABLE",
      "Downloads are not available in this environment.",
      503,
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = downloadRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "The download request was invalid.", 400);
  }
  const { productId, fileId, email, marketingConsent, consentTextVersion, source } = parsed.data;

  const supabase = getSupabaseServiceRoleClient();
  const { sessionId, isNew: isNewSession } = await getAnonymousSessionId();

  const ip = clientIp(request);
  const ipHash = ip ? hashValue(serverEnv.DOWNLOAD_HASH_SECRET, ip) : null;

  const { allowed } = await checkRateLimit(supabase, { ipHash, sessionId });
  if (!allowed) {
    return errorResponse("RATE_LIMITED", "Too many download requests. Please try again shortly.", 429);
  }

  const { data: product, error: productError } = await supabase
    .from("it_products")
    .select("id, access_type, status")
    .eq("id", productId)
    .maybeSingle();

  if (productError) {
    console.error("Product lookup failed:", productError.message);
    return errorResponse("INTERNAL_ERROR", "Something went wrong. Please try again.", 500);
  }

  const productAvailable = product && product.access_type === "free" && product.status === "published";
  if (!productAvailable) {
    return errorResponse("PRODUCT_NOT_AVAILABLE", "This download is not currently available.", 404);
  }

  const { data: version, error: versionError } = await supabase
    .from("it_product_versions")
    .select("id")
    .eq("product_id", productId)
    .eq("is_current", true)
    .maybeSingle();

  if (versionError) {
    console.error("Product version lookup failed:", versionError.message);
    return errorResponse("INTERNAL_ERROR", "Something went wrong. Please try again.", 500);
  }

  if (!version) {
    return errorResponse("PRODUCT_NOT_AVAILABLE", "This download is not currently available.", 404);
  }

  const { data: file, error: fileError } = await supabase
    .from("it_files")
    .select("id, storage_bucket, storage_path, original_filename")
    .eq("id", fileId)
    .eq("product_version_id", version.id)
    .maybeSingle();

  if (fileError) {
    console.error("File lookup failed:", fileError.message);
    return errorResponse("INTERNAL_ERROR", "Something went wrong. Please try again.", 500);
  }

  if (!file || file.storage_bucket !== BUCKET) {
    return errorResponse("PRODUCT_NOT_AVAILABLE", "This download is not currently available.", 404);
  }

  const { error: requestError } = await supabase.from("it_free_download_requests").insert({
    product_id: productId,
    email: email ?? null,
    marketing_consent: marketingConsent,
    consent_text_version: consentTextVersion ?? null,
    source: source ?? null,
    anonymous_session_id: sessionId,
  });

  if (requestError) {
    console.error("Failed to record free download request:", requestError.message);
    return errorResponse("INTERNAL_ERROR", "Something went wrong. Please try again.", 500);
  }

  const emailHash = email ? hashValue(serverEnv.DOWNLOAD_HASH_SECRET, email.toLowerCase()) : null;

  const { error: eventError } = await supabase.from("it_download_events").insert({
    file_id: fileId,
    product_id: productId,
    anonymous_session_id: sessionId,
    email_hash: emailHash,
    source: source ?? null,
    user_agent: request.headers.get("user-agent"),
    ip_hash: ipHash,
  });

  if (eventError) {
    console.error("Failed to record download event:", eventError.message);
    return errorResponse("INTERNAL_ERROR", "Something went wrong. Please try again.", 500);
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(file.storage_path, SIGNED_URL_TTL_SECONDS, {
      download: file.original_filename ?? true,
    });

  if (signedUrlError || !signedUrlData) {
    console.error("Failed to create signed URL:", signedUrlError?.message);
    return errorResponse("INTERNAL_ERROR", "Something went wrong. Please try again.", 500);
  }

  const expiresAt = new Date(Date.now() + SIGNED_URL_TTL_SECONDS * 1000).toISOString();
  const response = NextResponse.json({ downloadUrl: signedUrlData.signedUrl, expiresAt });

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

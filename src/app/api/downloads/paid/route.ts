import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { clientEnv } from "@/lib/env/client";
import { getSupabaseServiceRoleClient, hasServiceRoleConfig } from "@/lib/supabase/service-role-client";
import { errorResponse } from "@/server/downloads/errors";
import { PAID_FILES_BUCKET, resolvePaidOrderFile } from "@/server/checkout/resolve-paid-order-file";

export const runtime = "nodejs";

const SIGNED_URL_TTL_SECONDS = 5 * 60;

const paidDownloadRequestSchema = z.object({ sessionId: z.string().min(1) });

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // not all same-origin requests send Origin; this is defense-in-depth, not the primary control
  const allowed = clientEnv.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
  return origin === allowed;
}

/**
 * Real signed-URL file handoff (spec §17.3), unlike the free flow's grant-cookie-plus-
 * server-proxy pattern (built for inline markdown viewing, not a downloadable file). Access
 * control is entirely resolvePaidOrderFile's job — this route never trusts a client-supplied
 * productId/fileId, only the order proven by the Stripe Checkout Session id.
 */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return errorResponse("ORIGIN_REJECTED", "This request could not be verified.", 403);
  }

  if (!hasServiceRoleConfig()) {
    return errorResponse("SERVICE_UNAVAILABLE", "Downloads aren't available in this environment.", 503);
  }

  const body = await request.json().catch(() => null);
  const parsed = paidDownloadRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "The request was invalid.", 400);
  }

  const supabase = getSupabaseServiceRoleClient();
  const resolved = await resolvePaidOrderFile(supabase, { checkoutSessionId: parsed.data.sessionId });
  if (!resolved.ok) {
    return errorResponse("ORDER_NOT_AVAILABLE", "We couldn't find a paid order for this download.", 404);
  }

  const { data: signed, error: signError } = await supabase.storage
    .from(PAID_FILES_BUCKET)
    .createSignedUrl(resolved.storagePath, SIGNED_URL_TTL_SECONDS, { download: resolved.originalFilename ?? true });

  if (signError || !signed) {
    console.error("Failed to create signed download URL:", signError?.message);
    return errorResponse("INTERNAL_ERROR", "Something went wrong. Please try again.", 500);
  }

  return NextResponse.json({ url: signed.signedUrl });
}

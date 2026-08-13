import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { clientEnv } from "@/lib/env/client";
import { hasStripeConfig } from "@/lib/stripe/client";
import { getSupabaseServiceRoleClient, hasServiceRoleConfig } from "@/lib/supabase/service-role-client";
import { errorResponse } from "@/server/downloads/errors";
import { zId } from "@/lib/utils/id";
import { createCheckoutSession } from "@/server/checkout/create-checkout-session";

export const runtime = "nodejs";

const checkoutSessionRequestSchema = z.object({ productId: zId });

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // not all same-origin requests send Origin; this is defense-in-depth, not the primary control
  const allowed = clientEnv.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
  return origin === allowed;
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return errorResponse("ORIGIN_REJECTED", "This request could not be verified.", 403);
  }

  if (!hasServiceRoleConfig() || !hasStripeConfig()) {
    return errorResponse("SERVICE_UNAVAILABLE", "Checkout isn't available in this environment.", 503);
  }

  const body = await request.json().catch(() => null);
  const parsed = checkoutSessionRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "The request was invalid.", 400);
  }

  const supabase = getSupabaseServiceRoleClient();
  const result = await createCheckoutSession(supabase, {
    productId: parsed.data.productId,
    origin: request.nextUrl.origin,
  });

  if (!result.ok) {
    if (result.reason === "not_found") {
      return errorResponse("PRODUCT_NOT_AVAILABLE", "This product could not be found.", 404);
    }
    return errorResponse("PRODUCT_NOT_AVAILABLE", "This product isn't available for checkout right now.", 409);
  }

  return NextResponse.json({ url: result.url });
}

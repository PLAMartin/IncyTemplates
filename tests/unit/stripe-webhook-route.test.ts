import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { FakeSupabase } from "./helpers/fake-supabase";

const constructEventMock = vi.fn();
const hasStripeConfigMock = vi.fn(() => true);
const hasServiceRoleConfigMock = vi.fn(() => true);
const fulfillCheckoutSessionMock = vi.fn();

let supabase: FakeSupabase;

vi.mock("@/lib/env/server", () => ({ serverEnv: { STRIPE_WEBHOOK_SECRET: "whsec_test" } }));
vi.mock("@/lib/stripe/client", () => ({
  hasStripeConfig: hasStripeConfigMock,
  getStripeClient: () => ({ webhooks: { constructEvent: constructEventMock } }),
}));
vi.mock("@/lib/supabase/service-role-client", () => ({
  hasServiceRoleConfig: hasServiceRoleConfigMock,
  getSupabaseServiceRoleClient: () => supabase,
}));
vi.mock("@/server/checkout/fulfill-checkout-session", () => ({
  fulfillCheckoutSession: fulfillCheckoutSessionMock,
}));

const { POST } = await import("@/app/api/stripe/webhook/route");

function makeRequest(body: string, headers: Record<string, string> = { "stripe-signature": "t=1,v1=abc" }): NextRequest {
  return new NextRequest("http://localhost/api/stripe/webhook", { method: "POST", headers, body });
}

const CHECKOUT_EVENT = {
  id: "evt_test_123",
  type: "checkout.session.completed",
  data: { object: { id: "cs_test_abc123" } },
};

beforeEach(() => {
  constructEventMock.mockReset();
  fulfillCheckoutSessionMock.mockReset();
  hasStripeConfigMock.mockReturnValue(true);
  hasServiceRoleConfigMock.mockReturnValue(true);
  supabase = new FakeSupabase();
});

describe("POST /api/stripe/webhook", () => {
  it("returns 503 when Stripe isn't configured", async () => {
    hasStripeConfigMock.mockReturnValue(false);
    const response = await POST(makeRequest("{}"));
    expect(response.status).toBe(503);
    expect(constructEventMock).not.toHaveBeenCalled();
  });

  it("returns 503 when the service role client isn't configured", async () => {
    hasServiceRoleConfigMock.mockReturnValue(false);
    const response = await POST(makeRequest("{}"));
    expect(response.status).toBe(503);
  });

  it("returns 400 when the stripe-signature header is missing", async () => {
    const response = await POST(makeRequest("{}", {}));
    expect(response.status).toBe(400);
    expect(constructEventMock).not.toHaveBeenCalled();
  });

  it("returns 400 when signature verification fails", async () => {
    constructEventMock.mockImplementation(() => {
      throw new Error("No signatures found matching the expected signature for payload");
    });
    const response = await POST(makeRequest("{}"));
    expect(response.status).toBe(400);
  });

  it("records but does not process an event type other than checkout.session.completed", async () => {
    constructEventMock.mockReturnValue({ id: "evt_1", type: "charge.refunded", data: { object: {} } });
    supabase.queueResponse("it_webhook_events", { data: { id: "wh_1" }, error: null });

    const response = await POST(makeRequest("{}"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ received: true, processed: false });
    expect(fulfillCheckoutSessionMock).not.toHaveBeenCalled();
  });

  it("acknowledges a duplicate delivery without reprocessing", async () => {
    constructEventMock.mockReturnValue(CHECKOUT_EVENT);
    supabase.queueResponse("it_webhook_events", {
      data: null,
      error: { message: "duplicate key value violates unique constraint", code: "23505" },
    });

    const response = await POST(makeRequest("{}"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ received: true, duplicate: true });
    expect(fulfillCheckoutSessionMock).not.toHaveBeenCalled();
  });

  it("fulfils checkout.session.completed and marks the event processed", async () => {
    constructEventMock.mockReturnValue(CHECKOUT_EVENT);
    supabase.queueResponse("it_webhook_events", { data: { id: "wh_1" }, error: null }); // insert
    supabase.queueResponse("it_webhook_events", { data: null, error: null }); // update -> processed
    fulfillCheckoutSessionMock.mockResolvedValue({ ok: true, orderId: "o1", alreadyFulfilled: false });

    const response = await POST(makeRequest("{}"));
    const body = await response.json();

    expect(fulfillCheckoutSessionMock).toHaveBeenCalledWith(supabase, "cs_test_abc123");
    expect(response.status).toBe(200);
    expect(body).toEqual({ received: true });
    const updateCall = supabase.calls.find((c) => c.table === "it_webhook_events" && c.method === "update");
    expect(updateCall?.args[0]).toMatchObject({ processing_status: "processed" });
  });

  it("returns 500 and marks the event failed when fulfilment fails", async () => {
    constructEventMock.mockReturnValue(CHECKOUT_EVENT);
    supabase.queueResponse("it_webhook_events", { data: { id: "wh_1" }, error: null });
    supabase.queueResponse("it_webhook_events", { data: null, error: null }); // update -> failed
    fulfillCheckoutSessionMock.mockResolvedValue({ ok: false, reason: "Product not found" });

    const response = await POST(makeRequest("{}"));

    expect(response.status).toBe(500);
    const updateCall = supabase.calls.find((c) => c.table === "it_webhook_events" && c.method === "update");
    expect(updateCall?.args[0]).toMatchObject({ processing_status: "failed", last_error: "Product not found" });
  });
});

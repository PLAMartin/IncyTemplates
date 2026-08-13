import { describe, expect, it, vi, beforeEach } from "vitest";
import { FakeSupabase } from "./helpers/fake-supabase";

const retrieveSessionMock = vi.fn();

vi.mock("@/lib/stripe/client", () => ({
  getStripeClient: () => ({ checkout: { sessions: { retrieve: retrieveSessionMock } } }),
}));

const { fulfillCheckoutSession } = await import("@/server/checkout/fulfill-checkout-session");

const CHECKOUT_SESSION_ID = "cs_test_abc123";
const PRODUCT_ID = "1ca2f681-5c9d-120c-6258-0f5107d1b5dc";
const CUSTOMER_ID = "c1111111-1111-1111-1111-111111111111";
const ORDER_ID = "o1111111-1111-1111-1111-111111111111";
const ORDER_ITEM_ID = "i1111111-1111-1111-1111-111111111111";

function paidSession(overrides: Record<string, unknown> = {}) {
  return {
    id: CHECKOUT_SESSION_ID,
    payment_status: "paid",
    metadata: { product_id: PRODUCT_ID },
    customer_details: { email: "buyer@example.com" },
    customer_email: null,
    customer: "cus_test_123",
    payment_intent: "pi_test_123",
    amount_total: 900,
    currency: "gbp",
    ...overrides,
  };
}

function templateProductRow() {
  return { id: PRODUCT_ID, name: "Idea Intake", product_type: "template", currency_code: "GBP", price_minor: 900, stripe_price_id: "price_123" };
}

/** Programs the full happy-path sequence: new customer, order + item created, entitlement granted, audit logged. */
function programHappyPath(supabase: FakeSupabase, { productType = "template" }: { productType?: string } = {}) {
  supabase.queueResponse("it_orders", { data: null, error: null }); // no existing order
  supabase.queueResponse("it_products", { data: { ...templateProductRow(), product_type: productType }, error: null });
  supabase.queueResponse("it_customers", { data: null, error: null }); // no existing customer
  supabase.queueResponse("it_customers", { data: { id: CUSTOMER_ID }, error: null }); // insert result
  supabase.queueResponse("it_orders", { data: { id: ORDER_ID }, error: null }); // insert result
  supabase.queueResponse("it_order_items", { data: { id: ORDER_ITEM_ID }, error: null });
  supabase.queueRpcResponse(productType === "bundle" ? "it_expand_bundle_entitlements" : "it_grant_entitlement", { data: null, error: null });
  supabase.queueRpcResponse("it_write_audit_log", { data: null, error: null });
}

beforeEach(() => {
  retrieveSessionMock.mockReset();
});

describe("fulfillCheckoutSession", () => {
  it("short-circuits without calling Stripe when an order already exists for this session", async () => {
    const supabase = new FakeSupabase().queueResponse("it_orders", { data: { id: ORDER_ID }, error: null });
    const result = await fulfillCheckoutSession(supabase as never, CHECKOUT_SESSION_ID);
    expect(result).toEqual({ ok: true, orderId: ORDER_ID, alreadyFulfilled: true });
    expect(retrieveSessionMock).not.toHaveBeenCalled();
  });

  it("fails when the session isn't paid", async () => {
    const supabase = new FakeSupabase().queueResponse("it_orders", { data: null, error: null });
    retrieveSessionMock.mockResolvedValue(paidSession({ payment_status: "unpaid" }));
    const result = await fulfillCheckoutSession(supabase as never, CHECKOUT_SESSION_ID);
    expect(result.ok).toBe(false);
  });

  it("fails when the session has no product_id metadata", async () => {
    const supabase = new FakeSupabase().queueResponse("it_orders", { data: null, error: null });
    retrieveSessionMock.mockResolvedValue(paidSession({ metadata: {} }));
    const result = await fulfillCheckoutSession(supabase as never, CHECKOUT_SESSION_ID);
    expect(result.ok).toBe(false);
  });

  it("fails when the session has no customer email", async () => {
    const supabase = new FakeSupabase().queueResponse("it_orders", { data: null, error: null });
    retrieveSessionMock.mockResolvedValue(paidSession({ customer_details: null, customer_email: null }));
    const result = await fulfillCheckoutSession(supabase as never, CHECKOUT_SESSION_ID);
    expect(result.ok).toBe(false);
  });

  it("fails when the product referenced by metadata can't be found", async () => {
    const supabase = new FakeSupabase()
      .queueResponse("it_orders", { data: null, error: null })
      .queueResponse("it_products", { data: null, error: null });
    retrieveSessionMock.mockResolvedValue(paidSession());
    const result = await fulfillCheckoutSession(supabase as never, CHECKOUT_SESSION_ID);
    expect(result.ok).toBe(false);
  });

  it("creates a new customer, order, order item, and grants an entitlement for a template", async () => {
    const supabase = new FakeSupabase();
    programHappyPath(supabase);
    retrieveSessionMock.mockResolvedValue(paidSession());

    const result = await fulfillCheckoutSession(supabase as never, CHECKOUT_SESSION_ID);

    expect(result).toEqual({ ok: true, orderId: ORDER_ID, alreadyFulfilled: false });
    expect(supabase.rpcCalls.map((c) => c.name)).toEqual(["it_grant_entitlement", "it_write_audit_log"]);
    const grantCall = supabase.rpcCalls[0]!.args as Record<string, unknown>;
    expect(grantCall).toMatchObject({
      p_customer_id: CUSTOMER_ID,
      p_product_id: PRODUCT_ID,
      p_source_order_item_id: ORDER_ITEM_ID,
      p_source_bundle_product_id: null,
    });
  });

  it("expands bundle entitlements instead of granting a single one when product_type is bundle", async () => {
    const supabase = new FakeSupabase();
    programHappyPath(supabase, { productType: "bundle" });
    retrieveSessionMock.mockResolvedValue(paidSession());

    const result = await fulfillCheckoutSession(supabase as never, CHECKOUT_SESSION_ID);

    expect(result.ok).toBe(true);
    expect(supabase.rpcCalls.map((c) => c.name)).toEqual(["it_expand_bundle_entitlements", "it_write_audit_log"]);
    const expandCall = supabase.rpcCalls[0]!.args as Record<string, unknown>;
    expect(expandCall).toMatchObject({ p_bundle_product_id: PRODUCT_ID, p_customer_id: CUSTOMER_ID, p_source_order_item_id: ORDER_ITEM_ID });
  });

  it("reuses an existing active customer by email instead of creating a duplicate", async () => {
    const supabase = new FakeSupabase();
    supabase.queueResponse("it_orders", { data: null, error: null });
    supabase.queueResponse("it_products", { data: templateProductRow(), error: null });
    supabase.queueResponse("it_customers", { data: { id: CUSTOMER_ID }, error: null }); // existing customer found
    supabase.queueResponse("it_customers", { data: null, error: null }); // update result (no select().single(), just awaited)
    supabase.queueResponse("it_orders", { data: { id: ORDER_ID }, error: null });
    supabase.queueResponse("it_order_items", { data: { id: ORDER_ITEM_ID }, error: null });
    supabase.queueRpcResponse("it_grant_entitlement", { data: null, error: null });
    supabase.queueRpcResponse("it_write_audit_log", { data: null, error: null });
    retrieveSessionMock.mockResolvedValue(paidSession());

    const result = await fulfillCheckoutSession(supabase as never, CHECKOUT_SESSION_ID);

    expect(result.ok).toBe(true);
    const insertCalls = supabase.calls.filter((c) => c.table === "it_customers" && c.method === "insert");
    expect(insertCalls).toHaveLength(0);
  });

  it("treats a unique-violation race on the order insert as already-fulfilled", async () => {
    const supabase = new FakeSupabase();
    supabase.queueResponse("it_orders", { data: null, error: null }); // initial check: not found
    supabase.queueResponse("it_products", { data: templateProductRow(), error: null });
    supabase.queueResponse("it_customers", { data: null, error: null });
    supabase.queueResponse("it_customers", { data: { id: CUSTOMER_ID }, error: null });
    supabase.queueResponse("it_orders", { data: null, error: { message: "duplicate key value violates unique constraint", code: "23505" } });
    supabase.queueResponse("it_orders", { data: { id: ORDER_ID }, error: null }); // re-query after the race
    retrieveSessionMock.mockResolvedValue(paidSession());

    const result = await fulfillCheckoutSession(supabase as never, CHECKOUT_SESSION_ID);

    expect(result).toEqual({ ok: true, orderId: ORDER_ID, alreadyFulfilled: true });
  });
});

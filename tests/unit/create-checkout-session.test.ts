import { describe, expect, it, vi, beforeEach } from "vitest";
import { FakeSupabase } from "./helpers/fake-supabase";

const createSessionMock = vi.fn();

vi.mock("@/lib/stripe/client", () => ({
  getStripeClient: () => ({ checkout: { sessions: { create: createSessionMock } } }),
}));

const { createCheckoutSession } = await import("@/server/checkout/create-checkout-session");

const ORIGIN = "https://incytemplates.com";
const PRODUCT_ID = "1ca2f681-5c9d-120c-6258-0f5107d1b5dc";

beforeEach(() => {
  createSessionMock.mockReset();
});

describe("createCheckoutSession", () => {
  it("returns not_found when the product doesn't exist", async () => {
    const supabase = new FakeSupabase().queueResponse("it_products", { data: null, error: null });
    const result = await createCheckoutSession(supabase as never, { productId: PRODUCT_ID, origin: ORIGIN });
    expect(result).toEqual({ ok: false, reason: "not_found" });
    expect(createSessionMock).not.toHaveBeenCalled();
  });

  it("returns not_purchasable when the product isn't published", async () => {
    const supabase = new FakeSupabase().queueResponse("it_products", {
      data: { id: PRODUCT_ID, product_type: "template", access_type: "paid", status: "draft", stripe_price_id: "price_123" },
      error: null,
    });
    const result = await createCheckoutSession(supabase as never, { productId: PRODUCT_ID, origin: ORIGIN });
    expect(result).toEqual({ ok: false, reason: "not_purchasable" });
  });

  it("returns not_purchasable when the product is free", async () => {
    const supabase = new FakeSupabase().queueResponse("it_products", {
      data: { id: PRODUCT_ID, product_type: "template", access_type: "free", status: "published", stripe_price_id: null },
      error: null,
    });
    const result = await createCheckoutSession(supabase as never, { productId: PRODUCT_ID, origin: ORIGIN });
    expect(result).toEqual({ ok: false, reason: "not_purchasable" });
  });

  it("returns not_purchasable when the product has no stripe_price_id yet", async () => {
    const supabase = new FakeSupabase().queueResponse("it_products", {
      data: { id: PRODUCT_ID, product_type: "template", access_type: "paid", status: "published", stripe_price_id: null },
      error: null,
    });
    const result = await createCheckoutSession(supabase as never, { productId: PRODUCT_ID, origin: ORIGIN });
    expect(result).toEqual({ ok: false, reason: "not_purchasable" });
  });

  it("creates a Stripe Checkout Session and returns its url for a purchasable product", async () => {
    const supabase = new FakeSupabase().queueResponse("it_products", {
      data: { id: PRODUCT_ID, product_type: "template", access_type: "paid", status: "published", stripe_price_id: "price_123" },
      error: null,
    });
    createSessionMock.mockResolvedValue({ url: "https://checkout.stripe.com/pay/cs_test_abc" });

    const result = await createCheckoutSession(supabase as never, { productId: PRODUCT_ID, origin: ORIGIN });

    expect(result).toEqual({ ok: true, url: "https://checkout.stripe.com/pay/cs_test_abc" });
    expect(createSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "payment",
        line_items: [{ price: "price_123", quantity: 1 }],
        customer_creation: "always",
        success_url: `${ORIGIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${ORIGIN}/checkout/cancelled`,
        metadata: expect.objectContaining({ product_id: PRODUCT_ID, product_type: "template" }),
      }),
    );
  });

  it("returns not_purchasable when Stripe returns a session with no url", async () => {
    const supabase = new FakeSupabase().queueResponse("it_products", {
      data: { id: PRODUCT_ID, product_type: "template", access_type: "paid", status: "published", stripe_price_id: "price_123" },
      error: null,
    });
    createSessionMock.mockResolvedValue({ url: null });

    const result = await createCheckoutSession(supabase as never, { productId: PRODUCT_ID, origin: ORIGIN });
    expect(result).toEqual({ ok: false, reason: "not_purchasable" });
  });
});

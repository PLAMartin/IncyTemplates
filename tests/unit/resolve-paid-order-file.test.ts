import { describe, expect, it } from "vitest";
import { FakeSupabase } from "./helpers/fake-supabase";
import { resolvePaidOrderFile } from "@/server/checkout/resolve-paid-order-file";

const CHECKOUT_SESSION_ID = "cs_test_abc123";
const PRODUCT_ID = "1ca2f681-5c9d-120c-6258-0f5107d1b5dc";
const VERSION_ID = "v1111111-1111-1111-1111-111111111111";

describe("resolvePaidOrderFile", () => {
  it("returns not_found when no order exists for the checkout session", async () => {
    const supabase = new FakeSupabase().queueResponse("it_orders", { data: null, error: null });
    const result = await resolvePaidOrderFile(supabase as never, { checkoutSessionId: CHECKOUT_SESSION_ID });
    expect(result).toEqual({ ok: false, reason: "not_found" });
  });

  it("returns not_found when the order isn't paid", async () => {
    const supabase = new FakeSupabase().queueResponse("it_orders", {
      data: { id: "o1", status: "pending", it_order_items: [{ product_id: PRODUCT_ID }] },
      error: null,
    });
    const result = await resolvePaidOrderFile(supabase as never, { checkoutSessionId: CHECKOUT_SESSION_ID });
    expect(result).toEqual({ ok: false, reason: "not_found" });
  });

  it("returns not_found when the order has no order items", async () => {
    const supabase = new FakeSupabase().queueResponse("it_orders", {
      data: { id: "o1", status: "paid", it_order_items: [] },
      error: null,
    });
    const result = await resolvePaidOrderFile(supabase as never, { checkoutSessionId: CHECKOUT_SESSION_ID });
    expect(result).toEqual({ ok: false, reason: "not_found" });
  });

  it("returns not_found when the product has no current version", async () => {
    const supabase = new FakeSupabase()
      .queueResponse("it_orders", { data: { id: "o1", status: "paid", it_order_items: [{ product_id: PRODUCT_ID }] }, error: null })
      .queueResponse("it_product_versions", { data: null, error: null });
    const result = await resolvePaidOrderFile(supabase as never, { checkoutSessionId: CHECKOUT_SESSION_ID });
    expect(result).toEqual({ ok: false, reason: "not_found" });
  });

  it("returns not_found when the file isn't in the paid-files bucket", async () => {
    const supabase = new FakeSupabase()
      .queueResponse("it_orders", { data: { id: "o1", status: "paid", it_order_items: [{ product_id: PRODUCT_ID }] }, error: null })
      .queueResponse("it_product_versions", { data: { id: VERSION_ID }, error: null })
      .queueResponse("it_files", {
        data: { id: "f1", storage_bucket: "it-free-files", storage_path: "x/y/z.md", original_filename: "z.md" },
        error: null,
      });
    const result = await resolvePaidOrderFile(supabase as never, { checkoutSessionId: CHECKOUT_SESSION_ID });
    expect(result).toEqual({ ok: false, reason: "not_found" });
  });

  it("resolves the storage path for a paid, current-version template file", async () => {
    const supabase = new FakeSupabase()
      .queueResponse("it_orders", { data: { id: "o1", status: "paid", it_order_items: [{ product_id: PRODUCT_ID }] }, error: null })
      .queueResponse("it_product_versions", { data: { id: VERSION_ID }, error: null })
      .queueResponse("it_files", {
        data: { id: "f1", storage_bucket: "it-paid-files", storage_path: `${PRODUCT_ID}/${VERSION_ID}/template/idea-intake.md`, original_filename: "idea-intake.md" },
        error: null,
      });
    const result = await resolvePaidOrderFile(supabase as never, { checkoutSessionId: CHECKOUT_SESSION_ID });
    expect(result).toEqual({
      ok: true,
      storagePath: `${PRODUCT_ID}/${VERSION_ID}/template/idea-intake.md`,
      originalFilename: "idea-intake.md",
    });
  });
});

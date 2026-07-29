import { describe, expect, it } from "vitest";
import { downloadRequestSchema } from "@/server/downloads/schema";

const validRequest = {
  productId: "3d4b3b2c-1a2b-4c3d-9e8f-1234567890ab",
  fileId: "7f6e5d4c-3b2a-4c1d-8e9f-0987654321ba",
};

describe("downloadRequestSchema", () => {
  it("accepts the minimum valid request", () => {
    const result = downloadRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it("defaults marketingConsent to false when omitted", () => {
    const result = downloadRequestSchema.safeParse(validRequest);
    expect(result.success && result.data.marketingConsent).toBe(false);
  });

  it("accepts an optional email and consent fields", () => {
    const result = downloadRequestSchema.safeParse({
      ...validRequest,
      email: "reader@example.com",
      marketingConsent: true,
      consentTextVersion: "2026-07-01",
      source: "template-page",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-uuid productId", () => {
    const result = downloadRequestSchema.safeParse({ ...validRequest, productId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("rejects a non-uuid fileId", () => {
    const result = downloadRequestSchema.safeParse({ ...validRequest, fileId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = downloadRequestSchema.safeParse({ ...validRequest, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing productId", () => {
    const { productId, ...rest } = validRequest;
    void productId;
    const result = downloadRequestSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("accepts deterministic ids that aren't RFC4122-compliant UUIDs", () => {
    // scripts/lib/deterministic-uuid.ts reshapes a sha256 hash into UUID
    // grouping without setting the version/variant nibbles — real ids used
    // throughout the catalogue, e.g. product-idea-snapshot's product id.
    const result = downloadRequestSchema.safeParse({
      productId: "4a4bf14a-af34-dfa8-dca5-9c49cda6e795",
      fileId: "6884b5f4-bc89-8837-06cd-58c67e65b05d",
    });
    expect(result.success).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { mintViewGrant, verifyViewGrant } from "@/server/downloads/view-grant";

const expected = { productId: "3d4b3b2c-1a2b-4c3d-9e8f-1234567890ab", fileId: "7f6e5d4c-3b2a-4c1d-8e9f-0987654321ba" };

describe("mintViewGrant", () => {
  it("throws when no secret is configured", () => {
    expect(() => mintViewGrant(undefined, expected, 3600)).toThrow();
  });

  it("produces a token verifyViewGrant accepts", () => {
    const token = mintViewGrant("test-secret", expected, 3600);
    expect(verifyViewGrant(token, "test-secret", expected)).toBe(true);
  });
});

describe("verifyViewGrant", () => {
  it("returns false for a missing token", () => {
    expect(verifyViewGrant(undefined, "test-secret", expected)).toBe(false);
  });

  it("returns false when no secret is configured", () => {
    const token = mintViewGrant("test-secret", expected, 3600);
    expect(verifyViewGrant(token, undefined, expected)).toBe(false);
  });

  it("returns false for a mismatched productId", () => {
    const token = mintViewGrant("test-secret", expected, 3600);
    expect(verifyViewGrant(token, "test-secret", { ...expected, productId: "wrong-id" })).toBe(false);
  });

  it("returns false for a mismatched fileId", () => {
    const token = mintViewGrant("test-secret", expected, 3600);
    expect(verifyViewGrant(token, "test-secret", { ...expected, fileId: "wrong-id" })).toBe(false);
  });

  it("returns false for an expired grant", () => {
    const token = mintViewGrant("test-secret", expected, -1);
    expect(verifyViewGrant(token, "test-secret", expected)).toBe(false);
  });

  it("returns false for a tampered signature", () => {
    const token = mintViewGrant("test-secret", expected, 3600);
    const tampered = token.slice(0, -1) + (token.endsWith("0") ? "1" : "0");
    expect(verifyViewGrant(tampered, "test-secret", expected)).toBe(false);
  });

  it("returns false for a token signed with a different secret", () => {
    const token = mintViewGrant("secret-one", expected, 3600);
    expect(verifyViewGrant(token, "secret-two", expected)).toBe(false);
  });

  it("returns false for a malformed token", () => {
    expect(verifyViewGrant("not-a-real-token", "test-secret", expected)).toBe(false);
  });
});

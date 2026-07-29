import { describe, expect, it } from "vitest";
import { hashValue } from "@/server/downloads/hash";

describe("hashValue", () => {
  it("returns null when no secret is configured", () => {
    expect(hashValue(undefined, "203.0.113.1")).toBeNull();
  });

  it("is deterministic for the same secret and value", () => {
    const a = hashValue("test-secret", "203.0.113.1");
    const b = hashValue("test-secret", "203.0.113.1");
    expect(a).toEqual(b);
  });

  it("produces different hashes for different values", () => {
    const a = hashValue("test-secret", "203.0.113.1");
    const b = hashValue("test-secret", "203.0.113.2");
    expect(a).not.toEqual(b);
  });

  it("produces different hashes for different secrets", () => {
    const a = hashValue("secret-one", "203.0.113.1");
    const b = hashValue("secret-two", "203.0.113.1");
    expect(a).not.toEqual(b);
  });

  it("never returns the raw input value", () => {
    const hash = hashValue("test-secret", "203.0.113.1");
    expect(hash).not.toEqual("203.0.113.1");
  });
});

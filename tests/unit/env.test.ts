import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe("server env schema", () => {
  it("parses successfully with no cloud vars set (fixtures-mode requirement)", async () => {
    vi.resetModules();
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.EMAIL_FROM_ORDERS;
    const { serverEnv } = await import("@/lib/env/server");
    expect(serverEnv.APP_ENV).toBeDefined();
  });

  it("accepts an explicit valid APP_ENV and CONTENT_SOURCE", async () => {
    vi.resetModules();
    process.env.APP_ENV = "production";
    process.env.CONTENT_SOURCE = "fixtures";
    const { serverEnv } = await import("@/lib/env/server");
    expect(serverEnv.APP_ENV).toBe("production");
    expect(serverEnv.CONTENT_SOURCE).toBe("fixtures");
  });

  it("throws on an invalid email value", async () => {
    vi.resetModules();
    process.env.EMAIL_FROM_ORDERS = "not-an-email";
    await expect(import("@/lib/env/server")).rejects.toThrow();
  });

  it("throws on an invalid APP_ENV value", async () => {
    vi.resetModules();
    process.env.APP_ENV = "staging";
    await expect(import("@/lib/env/server")).rejects.toThrow();
  });
});

describe("client env schema", () => {
  it("parses successfully with no NEXT_PUBLIC_* vars set", async () => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    const { clientEnv } = await import("@/lib/env/client");
    expect(clientEnv.NEXT_PUBLIC_SUPABASE_URL).toBeUndefined();
  });

  it("throws on an invalid URL value", async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_SITE_URL = "not-a-url";
    await expect(import("@/lib/env/client")).rejects.toThrow();
  });

  it("accepts a valid Supabase URL", async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    const { clientEnv } = await import("@/lib/env/client");
    expect(clientEnv.NEXT_PUBLIC_SUPABASE_URL).toBe("https://example.supabase.co");
  });
});

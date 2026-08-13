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

  it("defaults visual-generation vars to the test provider with no config set", async () => {
    vi.resetModules();
    delete process.env.VISUAL_GENERATION_PROVIDER;
    delete process.env.OPENAI_API_KEY;
    const { serverEnv } = await import("@/lib/env/server");
    expect(serverEnv.VISUAL_GENERATION_ENABLED).toBe(true);
    expect(serverEnv.VISUAL_GENERATION_PROVIDER).toBe("test");
    expect(serverEnv.VISUAL_GENERATION_MAX_CANDIDATES).toBe(4);
    expect(serverEnv.OPENAI_IMAGE_MODEL).toBe("gpt-image-2");
    expect(serverEnv.OPENAI_API_KEY).toBeUndefined();
  });

  it("accepts an explicit openai provider selection and coerces numeric vars", async () => {
    vi.resetModules();
    process.env.VISUAL_GENERATION_PROVIDER = "openai";
    process.env.VISUAL_GENERATION_MAX_CANDIDATES = "2";
    process.env.VISUAL_GENERATION_TIMEOUT_MS = "45000";
    const { serverEnv } = await import("@/lib/env/server");
    expect(serverEnv.VISUAL_GENERATION_PROVIDER).toBe("openai");
    expect(serverEnv.VISUAL_GENERATION_MAX_CANDIDATES).toBe(2);
    expect(serverEnv.VISUAL_GENERATION_TIMEOUT_MS).toBe(45000);
  });

  it("throws on an unknown OPENAI_IMAGE_MODEL value", async () => {
    vi.resetModules();
    process.env.OPENAI_IMAGE_MODEL = "some-future-model";
    await expect(import("@/lib/env/server")).rejects.toThrow();
  });

  it("throws on an invalid VISUAL_GENERATION_PROVIDER value", async () => {
    vi.resetModules();
    process.env.VISUAL_GENERATION_PROVIDER = "stability";
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

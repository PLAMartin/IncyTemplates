import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe("visual provider registry", () => {
  it("resolves the test provider with no config at all", async () => {
    vi.resetModules();
    delete process.env.OPENAI_API_KEY;
    const { resolveVisualGenerationProvider } = await import("@/lib/visuals/providers");
    const provider = resolveVisualGenerationProvider("test");
    expect(provider.key).toBe("test");
  });

  it("defaults to the test provider when VISUAL_GENERATION_PROVIDER is unset", async () => {
    vi.resetModules();
    delete process.env.VISUAL_GENERATION_PROVIDER;
    const { resolveDefaultVisualGenerationProvider } = await import("@/lib/visuals/providers");
    expect(resolveDefaultVisualGenerationProvider()).toBe("test");
  });

  it("throws a clear config error when openai is requested without OPENAI_API_KEY", async () => {
    vi.resetModules();
    delete process.env.OPENAI_API_KEY;
    const { resolveVisualGenerationProvider } = await import("@/lib/visuals/providers");
    expect(() => resolveVisualGenerationProvider("openai")).toThrow(/OPENAI_API_KEY/);
  });

  it("does not silently fall back to the test provider when openai is unconfigured", async () => {
    vi.resetModules();
    delete process.env.OPENAI_API_KEY;
    const { resolveVisualGenerationProvider } = await import("@/lib/visuals/providers");
    let caught: unknown;
    try {
      resolveVisualGenerationProvider("openai");
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).message).not.toMatch(/test provider|falling back/i);
  });

  it("resolves the openai provider once OPENAI_API_KEY is set", async () => {
    vi.resetModules();
    process.env.OPENAI_API_KEY = "sk-test-fixture-key";
    const { resolveVisualGenerationProvider } = await import("@/lib/visuals/providers");
    const provider = resolveVisualGenerationProvider("openai");
    expect(provider.key).toBe("openai");
  });

  it("throws when visual generation is disabled, even with a key configured", async () => {
    vi.resetModules();
    process.env.OPENAI_API_KEY = "sk-test-fixture-key";
    process.env.VISUAL_GENERATION_ENABLED = "false";
    const { resolveVisualGenerationProvider } = await import("@/lib/visuals/providers");
    expect(() => resolveVisualGenerationProvider("openai")).toThrow(/disabled/);
  });

  it("lists both providers, with openai enabled only once configured", async () => {
    vi.resetModules();
    delete process.env.OPENAI_API_KEY;
    const withoutKey = await import("@/lib/visuals/providers");
    const statuses = withoutKey.listVisualProviderStatuses();
    expect(statuses.find((s) => s.key === "test")?.enabled).toBe(true);
    expect(statuses.find((s) => s.key === "openai")?.enabled).toBe(false);
    expect(statuses.find((s) => s.key === "openai")?.disabledReason).toMatch(/not configured/i);

    vi.resetModules();
    process.env.OPENAI_API_KEY = "sk-test-fixture-key";
    const withKey = await import("@/lib/visuals/providers");
    const enabledStatuses = withKey.listVisualProviderStatuses();
    expect(enabledStatuses.find((s) => s.key === "openai")?.enabled).toBe(true);
    expect(enabledStatuses.find((s) => s.key === "openai")?.disabledReason).toBeNull();
  });

  it("never exposes the API key value through listVisualProviderStatuses", async () => {
    vi.resetModules();
    process.env.OPENAI_API_KEY = "sk-test-fixture-key-should-not-leak";
    const { listVisualProviderStatuses } = await import("@/lib/visuals/providers");
    const serialised = JSON.stringify(listVisualProviderStatuses());
    expect(serialised).not.toContain("sk-test-fixture-key-should-not-leak");
  });
});

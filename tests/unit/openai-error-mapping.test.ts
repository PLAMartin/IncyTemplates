import { describe, expect, it } from "vitest";
import OpenAI from "openai";
import { mapOpenAiError } from "@/lib/visuals/providers/openai-errors";

function fabricate(status: number, error: Record<string, unknown>) {
  return OpenAI.APIError.generate(status, { error }, "fabricated for test", new Headers());
}

describe("mapOpenAiError", () => {
  it("maps 429 to rate_limited", () => {
    const mapped = mapOpenAiError(fabricate(429, { message: "Too many requests" }));
    expect(mapped.category).toBe("rate_limited");
  });

  it("maps a 400 with a moderation/content-policy code to safety_blocked", () => {
    const mapped = mapOpenAiError(
      fabricate(400, { message: "Your request was rejected by the safety system.", code: "content_policy_violation" }),
    );
    expect(mapped.category).toBe("safety_blocked");
  });

  it("maps an ordinary 400 to invalid_request", () => {
    const mapped = mapOpenAiError(fabricate(400, { message: "Missing required parameter: prompt", code: "missing_parameter" }));
    expect(mapped.category).toBe("invalid_request");
  });

  it("maps 401/403 to provider_unavailable", () => {
    expect(mapOpenAiError(fabricate(401, { message: "Invalid API key" })).category).toBe("provider_unavailable");
    expect(mapOpenAiError(fabricate(403, { message: "Forbidden" })).category).toBe("provider_unavailable");
  });

  it("maps 5xx to provider_unavailable", () => {
    expect(mapOpenAiError(fabricate(500, { message: "Internal error" })).category).toBe("provider_unavailable");
  });

  it("maps a connection timeout to timeout", () => {
    const mapped = mapOpenAiError(new OpenAI.APIConnectionTimeoutError());
    expect(mapped.category).toBe("timeout");
  });

  it("maps a generic connection error to provider_unavailable", () => {
    const mapped = mapOpenAiError(new OpenAI.APIConnectionError({ message: "network down" }));
    expect(mapped.category).toBe("provider_unavailable");
  });

  it("maps a non-OpenAI error to unknown", () => {
    const mapped = mapOpenAiError(new Error("something else went wrong"));
    expect(mapped.category).toBe("unknown");
  });

  it("never echoes the raw provider message into the safe message", () => {
    const rawMessage = "SECRET_PROMPT_FRAGMENT should never leak";
    const mapped = mapOpenAiError(fabricate(400, { message: rawMessage, code: "invalid_request" }));
    expect(mapped.message).not.toContain("SECRET_PROMPT_FRAGMENT");
  });
});

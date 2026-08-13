import OpenAI from "openai";
import { VisualGenerationError, type VisualProviderErrorCategory } from "./types";

const SAFETY_KEYWORDS = ["moderation", "safety", "content_policy", "content policy", "flagged"];

/**
 * Maps an OpenAI SDK error onto the stable categories spec v6 §12.7 requires every provider
 * adapter to use (`rate_limited | safety_blocked | invalid_request | timeout |
 * provider_unavailable | unknown`). Callers branch on `.category`, never on raw provider
 * status/message, since those are provider-specific and can carry prompt fragments unsafe to
 * persist. The raw error is attached as `cause` for local diagnostics only -- never forwarded
 * to `error_message_safe`/the Editor-facing message.
 */
export function mapOpenAiError(error: unknown): VisualGenerationError {
  if (error instanceof OpenAI.APIConnectionTimeoutError) {
    return new VisualGenerationError("timeout", "The image-generation request timed out. You can retry.", {
      cause: error,
    });
  }
  if (error instanceof OpenAI.APIConnectionError) {
    return new VisualGenerationError("provider_unavailable", "Could not reach the image-generation provider.", {
      cause: error,
    });
  }
  if (error instanceof OpenAI.RateLimitError) {
    return new VisualGenerationError(
      "rate_limited",
      "The image-generation provider is rate-limiting requests. Try again shortly.",
      { cause: error },
    );
  }
  if (error instanceof OpenAI.AuthenticationError || error instanceof OpenAI.PermissionDeniedError) {
    return new VisualGenerationError(
      "provider_unavailable",
      "The image-generation provider rejected the server's credentials. Check the provider configuration.",
      { cause: error },
    );
  }
  if (error instanceof OpenAI.InternalServerError) {
    return new VisualGenerationError(
      "provider_unavailable",
      "The image-generation provider reported an internal error. You can retry.",
      { cause: error },
    );
  }
  if (error instanceof OpenAI.BadRequestError || error instanceof OpenAI.UnprocessableEntityError) {
    const category: VisualProviderErrorCategory = looksLikeSafetyBlock(error) ? "safety_blocked" : "invalid_request";
    const message =
      category === "safety_blocked"
        ? "The provider declined to generate this candidate for safety reasons. Try editing the brief."
        : "The image-generation request was rejected as invalid. Check the brief and recipe.";
    return new VisualGenerationError(category, message, { cause: error });
  }
  if (error instanceof OpenAI.APIError) {
    return new VisualGenerationError("unknown", "The image-generation provider returned an unexpected error.", {
      cause: error,
    });
  }
  return new VisualGenerationError("unknown", "An unexpected error occurred while generating visuals.", {
    cause: error,
  });
}

function looksLikeSafetyBlock(error: InstanceType<typeof OpenAI.APIError>): boolean {
  const haystack = [error.code, error.type, error.param, error.message].filter(Boolean).join(" ").toLowerCase();
  return SAFETY_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

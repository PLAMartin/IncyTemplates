import { cookies } from "next/headers";

export const ANONYMOUS_SESSION_COOKIE = "it_anon_session";
export const ANONYMOUS_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/**
 * Reads the anonymous session id cookie, generating a new one if absent.
 * Read-only (route handlers set cookies on the response, not here) — the
 * caller is responsible for calling `applySessionCookie` on the response
 * when `isNew` is true.
 */
export async function getAnonymousSessionId(): Promise<{ sessionId: string; isNew: boolean }> {
  const store = await cookies();
  const existing = store.get(ANONYMOUS_SESSION_COOKIE)?.value;
  if (existing) return { sessionId: existing, isNew: false };
  return { sessionId: crypto.randomUUID(), isNew: true };
}

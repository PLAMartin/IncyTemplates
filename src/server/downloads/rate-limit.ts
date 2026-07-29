import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Tunable defaults, not final production numbers (spec §20.2: per-IP and
 * per-session rate limiting). Backed by it_download_events, which already
 * has ip_hash/anonymous_session_id columns for exactly this — no new
 * rate-limiting infra.
 */
const MAX_REQUESTS_PER_IP = 5;
const IP_WINDOW_MINUTES = 10;
const MAX_REQUESTS_PER_SESSION = 8;
const SESSION_WINDOW_MINUTES = 60;

async function countRecent(
  supabase: SupabaseClient,
  column: "ip_hash" | "anonymous_session_id",
  value: string,
  windowMinutes: number,
): Promise<number> {
  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from("it_download_events")
    .select("id", { count: "exact", head: true })
    .eq(column, value)
    .gte("downloaded_at", since);

  if (error) {
    console.error(`Rate-limit count query failed for ${column}:`, error.message);
    return 0;
  }
  return count ?? 0;
}

/**
 * Returns whether a download request should be allowed. `ipHash` is null
 * when DOWNLOAD_HASH_SECRET is unset — in that case the per-IP check is
 * skipped (logged, not fatal) and only the per-session check applies.
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  { ipHash, sessionId }: { ipHash: string | null; sessionId: string },
): Promise<{ allowed: boolean }> {
  if (!ipHash) {
    console.warn("DOWNLOAD_HASH_SECRET unset — skipping per-IP rate limiting for this request.");
  }

  const [ipCount, sessionCount] = await Promise.all([
    ipHash ? countRecent(supabase, "ip_hash", ipHash, IP_WINDOW_MINUTES) : Promise.resolve(0),
    countRecent(supabase, "anonymous_session_id", sessionId, SESSION_WINDOW_MINUTES),
  ]);

  if (ipHash && ipCount >= MAX_REQUESTS_PER_IP) return { allowed: false };
  if (sessionCount >= MAX_REQUESTS_PER_SESSION) return { allowed: false };
  return { allowed: true };
}

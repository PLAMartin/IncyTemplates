import { TriangleAlert } from "lucide-react";
import { usingFixtureSource } from "@/server/queries";

/**
 * Non-production notice shown only when the fixture content source is
 * active (no Supabase project configured). Server Component — reads
 * `usingFixtureSource`, computed once at module load in
 * `src/server/queries/index.ts`, no client JS required.
 */
export function ContentSourceBanner() {
  if (!usingFixtureSource) return null;

  return (
    <div className="border-b border-amber-500 bg-amber-100 px-4 py-2 text-center text-xs text-amber-700 sm:px-6">
      <p className="mx-auto flex max-w-6xl items-center justify-center gap-2">
        <TriangleAlert aria-hidden className="size-3.5 shrink-0" />
        Showing local placeholder data — connect Supabase to see live content.
      </p>
    </div>
  );
}

/** Mirrors the `it_public_visibility` Postgres enum (spec v4 §14.2). */
export type PublicVisibility = "public" | "unlisted" | "hidden";

export const PUBLIC_VISIBILITY_VALUES: readonly PublicVisibility[] = ["public", "unlisted", "hidden"];

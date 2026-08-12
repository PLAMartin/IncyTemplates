# 0046 — Visual Recipe v1: the shipped pine/teal identity, not spec's navy/purple description

## Status
Accepted

## Context
`0045` flagged this as blocking: spec v5 §11.6 describes Visual Recipe v1 as "dark navy primary
... purple as the main structural/action accent ... pale lilac, mint and cream surfaces," but the
site's actual, already-shipped visual identity across all 23 live product families and the admin
panel is pine/teal + warm paper + amber (`docs/decisions/0002-visual-identity-direction.md`,
`src/app/globals.css`'s `--color-brand-*`/`--color-paper`/`--color-accent-amber-*` tokens). Spec
§44 item 2 explicitly listed the Visual Recipe's design tokens as an open product-owner decision
rather than a settled fact — this was never something to resolve by guessing which of two
conflicting palette descriptions wins. Asked directly; answer: use the existing pine/teal
identity.

## Decision
Seeded via `scripts/seed-visual-recipe.ts` (`npm run seed:visual-recipe`), against the live
project: `it_visual_recipes` row `incytemplates-v1` v1, `status: 'approved'`, `created_by`/
`approved_by` set to the owner profile, `approved_at` set to seed time — this is a genuine
product-owner decision made directly in conversation, not a placeholder draft awaiting a UI that
doesn't exist yet (the admin Visual Recipe administration UI is still unbuilt per `0045`'s
follow-up).

`config_data` stores design-token *names*, not raw colour values, per spec's own instruction to
"reference named design tokens from the application theme rather than duplicate ... colour
values":

- `backgroundToken: "--color-paper"`, `primaryToken: "--color-ink-900"` — spec's "white/pale
  background" and "dark primary type/line colour" bullets both still hold; only the specific hue
  changes (paper/ink rather than an unbuilt navy).
- `structuralAccentToken: "--color-brand-500"` — this repo's pine/teal brand accent stands in for
  spec's purple.
- `supportingAccentTokens: ["--color-accent-amber-500"]` — spec called for "restrained green and
  amber" supporting accents; green is dropped from the *supporting* list here because it's
  already the *primary* structural accent (`--color-brand-500` itself is a teal/green), so listing
  it again as "supporting" would be redundant.
- `surfaceTokens: ["--color-brand-100", "--color-accent-amber-100", "--color-ink-100"]` — spec's
  "lilac, mint and cream surfaces" have no equivalent tokens in this theme at all; substituted
  with the theme's actual pale-surface tokens (brand/amber/ink at their lightest steps).
- `style`/`avoid` arrays are copied from spec §11.6 near-verbatim (flat 2D, generous whitespace,
  thin consistent-stroke icons, no photorealism/stock-photo/3D, no logos) — those rules are
  independent of which specific colours are chosen, so no reason to deviate there.

`prompt_template` assembles these into provider-instruction text per spec §11.6's guidance
("communicate one concept clearly," avoid headings/paragraphs/logos/decorative words unless the
asset type permits them) using `{{token}}` placeholders the not-yet-built generation service will
interpolate.

Spec v5 §44 item 2 marked resolved in place (`docs/Incytemplates-website-spec-v5.md`), matching
the existing convention for item 12 (free-download email resolution,
`16d7375`/`docs/decisions/0016...`-adjacent).

## Follow-up
`0002-visual-identity-direction.md` itself is still formally "Proposed — owner-pending" for the
site's *UI* identity, separate from this decision about the *visual-asset* palette specifically —
this doesn't retroactively close that ADR, though the two are now aligned rather than at risk of
diverging. The admin Visuals workspace UI (`0045`'s other open follow-up item) is still unbuilt;
once it exists, Visual Recipe v2+ activation is Admin/Owner-restricted per spec §16.3/§44 item 27.

/**
 * Deterministic `rendered`-source-type visual for Product Idea Assessor's family_card/
 * family_hero (spec v5 §11.8: "guide_diagram: Generated, uploaded or deterministic SVG/HTML" —
 * nothing in the asset-type table forbids the same deterministic-SVG approach for family
 * card/hero, and no production image-generation provider is selected yet, spec §44 item 25).
 * Proves the Visual Asset System pipeline end-to-end (render -> stage -> approve -> publish ->
 * public rendering) with a real, honest artefact instead of guessing at AI-generated imagery
 * before a provider decision exists — see docs/decisions/0047-product-idea-assessor-visual.md.
 *
 * Purely iconographic (no embedded words) so it never depends on baked-in text for meaning
 * (spec §11.9): three abstract "idea" notes converging into one approved result card,
 * representing "fragmented signals -> one scored decision." Colours are the resolved light-mode
 * hex values behind Visual Recipe v1's token names (`incytemplates-v1` v1,
 * scripts/seed-visual-recipe.ts) — a standalone SVG file has no access to the page's CSS custom
 * properties when loaded via `<img src>`, so token names are resolved to concrete values here at
 * render time, not referenced live.
 */

const TOKEN_HEX = {
  paper: "#faf8f4",
  paperRaised: "#ffffff",
  ink900: "#1b1a17",
  ink500: "#6b665f",
  ink200: "#ddd7cc",
  brand600: "#1a6e5f",
  brand500: "#21876f",
  brand100: "#e3efe9",
  amber500: "#c58a2e",
  amber100: "#f8ecd6",
} as const;

/** 4:3 viewBox — used at multiple logical sizes (card/hero) since SVG scales losslessly. */
const VIEW_WIDTH = 800;
const VIEW_HEIGHT = 600;

function noteCard(x: number, y: number, fill: string): string {
  const w = 140;
  const h = 90;
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${fill}" stroke="${TOKEN_HEX.ink200}" stroke-width="2"/>
    <rect x="${x + 20}" y="${y + 28}" width="${w - 40}" height="8" rx="4" fill="${TOKEN_HEX.ink500}"/>
    <rect x="${x + 20}" y="${y + 48}" width="${w - 70}" height="8" rx="4" fill="${TOKEN_HEX.ink500}" opacity="0.6"/>
  `;
}

/**
 * Renders the master SVG. Pure and deterministic: identical output for identical (implicit,
 * currently fixed) input every time, matching spec §12.6's "deterministic image processing"
 * requirement for anything downstream of an approved master.
 */
export function renderProductIdeaAssessorFamilySvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}" role="img">
  <rect width="${VIEW_WIDTH}" height="${VIEW_HEIGHT}" fill="${TOKEN_HEX.paper}"/>

  <path d="M140,160 Q270,300 400,380" fill="none" stroke="${TOKEN_HEX.brand500}" stroke-width="3" opacity="0.7"/>
  <path d="M400,140 L400,380" fill="none" stroke="${TOKEN_HEX.brand500}" stroke-width="3" opacity="0.7"/>
  <path d="M660,160 Q530,300 400,380" fill="none" stroke="${TOKEN_HEX.brand500}" stroke-width="3" opacity="0.7"/>

  ${noteCard(70, 70, TOKEN_HEX.brand100)}
  ${noteCard(330, 50, TOKEN_HEX.amber100)}
  ${noteCard(590, 70, TOKEN_HEX.ink200)}

  <rect x="290" y="380" width="220" height="140" rx="20" fill="${TOKEN_HEX.paperRaised}" stroke="${TOKEN_HEX.brand600}" stroke-width="4"/>
  <path d="M355,450 L390,485 L455,415" fill="none" stroke="${TOKEN_HEX.brand600}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>

  <circle cx="486" cy="404" r="16" fill="${TOKEN_HEX.amber500}" stroke="${TOKEN_HEX.paperRaised}" stroke-width="3"/>
</svg>`;
}

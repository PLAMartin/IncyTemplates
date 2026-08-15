import { suggestUses } from "../src/lib/source-mapping/suggest";
import type {
  Frequency,
  JudgementLevel,
  MethodTag,
  ReuseComponentScores,
  SourcePostAssessment,
  SourceStage,
  SuggestedFrameworkMapping,
} from "../src/lib/source-mapping/schema";

/**
 * Deterministic, rules-based Reuse Taxonomy v1 classifier (spec v7 §23.2, §12.8: "AI
 * assistance is optional... the architecture must support seeded/manual assessments and
 * rule-based analysis without an external model"). No LLM call, same posture as
 * `src/lib/finder/rules.ts` (docs/decisions/0026: "do not use an LLM for deterministic
 * routing"). Every suggestion this produces is advisory and reviewed by an Editor in
 * `/admin/source-posts` — the goal is a reasonable, reproducible starting point, not a
 * perfect classification.
 *
 * Pure function, no I/O: `scripts/import-abitgamey-assessments.ts` reads the local corpus and
 * live framework rows and passes them in here, mirroring `resolveNextStep(input, frameworks)`
 * in `src/lib/finder/rules.ts` so this stays unit-testable without a filesystem or database.
 */

export type RawSourcePost = {
  postId: string;
  title: string;
  subtitle: string | null;
  /** Slug from the existing 16-category A Bit Gamey *subject* taxonomy
   * (`content/catalogue/categories.json` in the ABitGamey repo) — a different taxonomy from
   * Reuse Taxonomy v1 (spec v7 §7.5), used here only as a per-category default signal. */
  category: string | null;
  html: string;
};

export type SourceMappingFrameworkOption = {
  id: string;
  slug: string;
  name: string;
  outcomeStatement: string;
  methodSummary: string | null;
};

/**
 * Per-category defaults, hand-derived from the ABitGamey repo's own
 * `docs/content-categories.md` prioritisation notes (each category already has curated
 * Guide/Template/Tool angle notes there) — reused here rather than re-deriving them, and
 * documented so a reviewer can trace every default back to its source.
 */
const CATEGORY_DEFAULTS: Record<string, { stage: SourceStage; toolFriendly: boolean; productFriendly: boolean }> = {
  "mindset-philosophy": { stage: "improve", toolFriendly: false, productFriendly: false },
  "product-strategy": { stage: "assess", toolFriendly: true, productFriendly: true },
  "decision-making": { stage: "decide", toolFriendly: true, productFriendly: true },
  "productivity-focus": { stage: "execute", toolFriendly: true, productFriendly: true },
  "writing-communication": { stage: "execute", toolFriendly: false, productFriendly: true },
  "growth-marketing": { stage: "execute", toolFriendly: true, productFriendly: true },
  "creativity-ideation": { stage: "discover", toolFriendly: true, productFriendly: true },
  "wealth-career": { stage: "improve", toolFriendly: false, productFriendly: false },
  "product-design": { stage: "plan", toolFriendly: false, productFriendly: true },
  "founder-journey": { stage: "review", toolFriendly: false, productFriendly: false },
  "ai-tools": { stage: "execute", toolFriendly: true, productFriendly: true },
  "building-shipping": { stage: "execute", toolFriendly: true, productFriendly: true },
  "branding-naming": { stage: "plan", toolFriendly: true, productFriendly: true },
  "engagement-retention": { stage: "plan", toolFriendly: true, productFriendly: true },
  "negotiation-influence": { stage: "execute", toolFriendly: false, productFriendly: true },
  "pricing-monetisation": { stage: "decide", toolFriendly: true, productFriendly: true },
};
const DEFAULT_CATEGORY = { stage: "assess" as SourceStage, toolFriendly: false, productFriendly: true };

/** Spec v7 §7.5's "Suggested defaults" table (reuse stage -> public journey destination),
 * recorded here as advisory text (`suggested_public_stage_key`) — the DB column is
 * deliberately not an `it_stages` foreign key, since the spec frames the final public stage
 * as always an Editor decision, not a mapping the classifier can commit to. */
const STAGE_TO_JOURNEY_KEY: Record<SourceStage, string> = {
  discover: "idea",
  assess: "validate",
  decide: "decide",
  plan: "design",
  execute: "build",
  review: "improve",
  improve: "improve",
};

const TITLE_NUMBERED = /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(ways|steps|tips|rules|principles|secrets|lessons|things|levers|reasons|questions|laws|habits|mistakes)\b/i;
const ACTION_TITLE = /^how to |^how i |^the secret to |^guide to /i;
const DECISION_KEYWORDS = /\b(decision|choose|choosing|assess|evaluat|score|scoring|framework|checklist|worksheet|template|calculat|compare|comparison)\b/i;
const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
  "your",
  "our",
  "how",
  "what",
  "why",
  "is",
  "are",
  "this",
  "that",
  "it",
  "be",
  "we",
]);

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countListItems(html: string): number {
  return (html.match(/<li[\s>]/gi) ?? []).length;
}

function significantWords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length >= 4 && !STOPWORDS.has(word)),
  );
}

function deriveMethodTags(title: string, plainText: string): MethodTag[] {
  const tags: MethodTag[] = [];
  const t = title.toLowerCase();
  if (/checklist|tips|rules|principles|habits/.test(t)) tags.push("checklist");
  if (/steps?|process/.test(t)) tags.push("process");
  if (/template|worksheet/.test(t) || /template|worksheet/i.test(plainText)) tags.push("worksheet");
  if (/canvas/i.test(plainText)) tags.push("canvas");
  if (/decision|choose|choosing/.test(t)) tags.push("decision_rule");
  if (/score|scoring/i.test(plainText)) tags.push("score");
  if (/calculat/i.test(plainText)) tags.push("calculation");
  if (/assess|evaluat|diagnos/.test(t)) tags.push("diagnostic");
  if (/generat|ideas/.test(t)) tags.push("generator");
  if (/\bvs\b|versus|compare|comparison/.test(t)) tags.push("comparison");
  if (/taught me|lessons from/.test(t)) tags.push("case_study");
  if (tags.length === 0) tags.push("principle");
  return Array.from(new Set(tags));
}

function deriveScores(
  category: { toolFriendly: boolean; productFriendly: boolean },
  title: string,
  subtitle: string,
  tags: MethodTag[],
  listItemCount: number,
): ReuseComponentScores {
  const numberedTitle = TITLE_NUMBERED.test(title);
  const titleAndSubtitle = `${title} ${subtitle}`;
  const structuredSignal = listItemCount >= 5 ? 2 : listItemCount >= 2 ? 1 : 0;

  const structure = category.productFriendly ? structuredSignal : Math.min(structuredSignal, 1);

  const actionability = numberedTitle || listItemCount >= 3 ? 2 : listItemCount >= 1 || ACTION_TITLE.test(title) ? 1 : 0;

  const repeatabilityTagHit = tags.some((tag) => ["process", "checklist", "worksheet", "decision_rule"].includes(tag));
  const repeatability = repeatabilityTagHit ? (category.toolFriendly ? 2 : 1) : category.productFriendly ? 1 : 0;

  let problem = category.productFriendly ? 1 : 0;
  if (DECISION_KEYWORDS.test(titleAndSubtitle) || ACTION_TITLE.test(title)) {
    problem = Math.min(2, problem + 1);
  }

  const automationTagHit = tags.some((tag) => ["score", "calculation", "decision_rule", "diagnostic", "generator"].includes(tag));
  let automation = 0;
  if (category.toolFriendly && automationTagHit) {
    automation = structuredSignal >= 1 ? 2 : 1;
  }

  return { problem, actionability, repeatability, structure, automation };
}

function deriveJudgementLevel(category: { productFriendly: boolean }, scores: ReuseComponentScores): JudgementLevel {
  if (!category.productFriendly) return "high";
  if (scores.automation === 2 && scores.structure === 2) return "low";
  return "medium";
}

function deriveFrequency(category: { toolFriendly: boolean; productFriendly: boolean }, tags: MethodTag[]): Frequency {
  const recurringTagHit = tags.some((tag) => ["process", "checklist"].includes(tag));
  if (recurringTagHit && category.toolFriendly) return "recurring";
  if (category.productFriendly) return "occasional";
  return "one_off";
}

function suggestFrameworkMappings(
  post: RawSourcePost,
  frameworks: SourceMappingFrameworkOption[],
  outputUses: SourcePostAssessment["suggestedUses"],
): SuggestedFrameworkMapping[] {
  // A pure source_only suggestion (no Guide added) doesn't productise the post at all —
  // spec v7: "source_only normally produces no it_framework_source_posts row". An Editor can
  // still add a manual mapping later if the post is useful background/evidence for a family.
  const linkableUses = outputUses.filter((use) => use !== "source_only");
  if (linkableUses.length === 0) return [];

  const postWords = significantWords(`${post.title} ${post.subtitle ?? ""} ${post.category ?? ""}`);

  const ranked = frameworks
    .map((framework) => {
      const frameworkWords = significantWords(`${framework.name} ${framework.outcomeStatement} ${framework.methodSummary ?? ""}`);
      const overlap = [...postWords].filter((word) => frameworkWords.has(word));
      return { framework, overlap };
    })
    .filter((entry) => entry.overlap.length > 0)
    .sort((a, b) => b.overlap.length - a.overlap.length)
    .slice(0, 2);

  return ranked.map(({ framework, overlap }) => ({
    frameworkId: framework.id,
    candidateName: null,
    candidateSlug: null,
    contributionType: overlap.length >= 3 ? "primary_method" : "supporting_method",
    outputUses: linkableUses,
    confidence: Math.min(0.9, Math.max(0.15, overlap.length / 6)),
    rationale: `Title/subtitle share keywords with ${framework.name}: ${overlap.slice(0, 5).join(", ")}.`,
  }));
}

export function assessAbitGameyPost(post: RawSourcePost, frameworks: SourceMappingFrameworkOption[]): SourcePostAssessment {
  const category = (post.category && CATEGORY_DEFAULTS[post.category]) || DEFAULT_CATEGORY;
  const title = post.title.trim();
  const subtitle = (post.subtitle ?? "").trim();
  const plainText = stripHtml(post.html);
  const listItemCount = countListItems(post.html);

  const methodTags = deriveMethodTags(title, plainText);
  const scores = deriveScores(category, title, subtitle, methodTags, listItemCount);

  // Founder Journey posts are explicitly "provenance/story material, not product-generating"
  // per docs/content-categories.md — every other category has at least a reusable
  // principle/method worth explaining, so it's Guide-eligible regardless of score band.
  const hasTeachableMethod = post.category !== "founder-journey";
  const suggestedUses = suggestUses(scores, hasTeachableMethod);

  const extractedPrinciple = subtitle.length > 0 ? subtitle : plainText.split(/(?<=[.!?])\s/)[0]?.slice(0, 200) || null;
  const userTask = ACTION_TITLE.test(title) ? title.replace(ACTION_TITLE, "").trim() : `Apply the method in "${title}"`;

  return {
    taxonomyVersion: "reuse-v1",
    analysisVersion: "rules-v1",
    analysisMethod: "rules",
    extractedPrinciple,
    dimensions: {
      problemStatement: extractedPrinciple ? `Helps a founder: ${extractedPrinciple}` : null,
      sourceStage: category.stage,
      userTask,
      methodTags,
      frequency: deriveFrequency(category, methodTags),
      judgementLevel: deriveJudgementLevel(category, scores),
    },
    scores,
    suggestedUses,
    suggestedFrameworks: suggestFrameworkMappings(post, frameworks, suggestedUses),
    suggestedPublicStageKey: STAGE_TO_JOURNEY_KEY[category.stage],
    confidence: null,
    rationale: `Rules-based classification from category "${post.category ?? "uncategorised"}", ${listItemCount} list item(s), ${methodTags.join("/")} method tag(s).`,
  };
}

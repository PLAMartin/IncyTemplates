import type {
  FinderFrameworkOption,
  FinderInput,
  FinderOutputType,
  FinderRecommendation,
  FinderResult,
  Outcome,
  OutputPreference,
  Progress,
} from "./schema";

/**
 * Deterministic routing rules for the Next Step Finder (spec v3 §22.4: "use configurable
 * rules/weights stored as data and tested in code. Do not use an LLM for deterministic
 * routing in MVP"). Every rule here is a fixed lookup table or a small pure function, so
 * the same input against the same catalogue always produces the same result — no AI call,
 * no randomness, fully unit-testable without a browser or a database.
 */

// A visitor picking a specific outcome should land on exactly the framework that promises
// it — this is the "what are you working on" + "which journey stage" questions collapsed
// into one, since each framework already owns a single journey stage (spec v3 §22.2's
// question list is explicitly "for example," not mandatory). `not_sure` has no fixed
// mapping — see `pickFramework` below for its fallback.
export const OUTCOME_FRAMEWORK_SLUG: Record<Exclude<Outcome, "not_sure">, string> = {
  assess_idea: "product-idea-assessor",
  gather_evidence: "customer-discovery-kit",
  make_a_decision: "better-decision-maker",
  scope_the_build: "mvp-scoper",
  choose_a_name: "product-naming-system",
  find_customers: "first-customers-planner",
  check_fit: "product-market-fit-tracker",
  choose_pricing: "pricing-your-product",
  generate_ideas: "product-idea-generator",
  choose_business_model: "business-model-chooser",
  pick_a_decision_framework: "decision-framework-picker",
  build_positioning: "product-positioning-builder",
};

const PROGRESS_OUTPUT_TYPE: Record<Progress, FinderOutputType> = {
  nothing_yet: "guide",
  some_thinking_or_evidence: "template",
  clear_decision_or_scope: "tool",
};

const PREFERENCE_OUTPUT_TYPE: Partial<Record<OutputPreference, FinderOutputType>> = {
  learn: "guide",
  structure_it_myself: "template",
  interactive_result: "tool",
};

const OUTPUT_TYPE_ROLE: Record<FinderOutputType, string> = {
  guide: "learn the method",
  template: "work through it yourself",
  tool: "get an interactive, scored result",
};

// If a framework doesn't (yet) have the exact output type the answers point to, fall back
// to whichever of these is available, most-interactive first.
const OUTPUT_TYPE_FALLBACK_ORDER: FinderOutputType[] = ["tool", "template", "guide"];

/** Reverse lookup of `OUTCOME_FRAMEWORK_SLUG`, for the UI layer to generate its "which
 * outcome" question options directly from real framework data rather than hand-maintaining
 * a second copy of the mapping. */
export function outcomeForFrameworkSlug(slug: string): Outcome | null {
  const entry = (Object.entries(OUTCOME_FRAMEWORK_SLUG) as [Exclude<Outcome, "not_sure">, string][]).find(
    ([, frameworkSlug]) => frameworkSlug === slug,
  );
  return entry?.[0] ?? null;
}

/** Picks the desired output type before checking what's actually available: an explicit
 * preference always wins over the progress-based guess. */
function desiredOutputType(progress: Progress, preference: OutputPreference): FinderOutputType {
  return PREFERENCE_OUTPUT_TYPE[preference] ?? PROGRESS_OUTPUT_TYPE[progress];
}

function resolveAvailableOutputType(framework: FinderFrameworkOption, desired: FinderOutputType): FinderOutputType {
  if (framework.outputs.some((o) => o.productType === desired)) return desired;
  const fallback = OUTPUT_TYPE_FALLBACK_ORDER.find((type) => framework.outputs.some((o) => o.productType === type));
  return fallback ?? desired;
}

function isOutputFree(framework: FinderFrameworkOption, outputType: FinderOutputType): boolean {
  return framework.outputs.find((o) => o.productType === outputType)?.accessType === "free";
}

/** Resolves which framework answers the visitor's outcome. `not_sure` (and any outcome
 * whose mapped framework isn't in the available set — e.g. a future unpublished family)
 * falls back to the flagship starting point, Product Idea Assessor, or whatever's first if
 * even that isn't available. */
function pickFramework(outcome: Outcome, frameworks: FinderFrameworkOption[]): FinderFrameworkOption | null {
  if (outcome !== "not_sure") {
    const match = frameworks.find((f) => f.slug === OUTCOME_FRAMEWORK_SLUG[outcome]);
    if (match) return match;
  }
  return frameworks.find((f) => f.slug === "product-idea-assessor") ?? frameworks[0] ?? null;
}

function reasonFor(framework: FinderFrameworkOption, outputType: FinderOutputType, outcome: Outcome): string {
  const intro = outcome === "not_sure" ? "Not sure yet? Here's a sensible place to start: " : "";
  return `${intro}${framework.outcomeStatement} The best place to start is the ${framework.name} output that lets you ${OUTPUT_TYPE_ROLE[outputType]}.`;
}

export function resolveNextStep(input: FinderInput, frameworks: FinderFrameworkOption[]): FinderResult | null {
  const framework = pickFramework(input.outcome, frameworks);
  if (!framework) return null;

  const outputType = resolveAvailableOutputType(framework, desiredOutputType(input.progress, input.outputPreference));

  const primary: FinderRecommendation = {
    frameworkSlug: framework.slug,
    outputType,
    reason: reasonFor(framework, outputType, input.outcome),
  };

  const supporting: FinderRecommendation[] = [];

  // If the recommendation isn't the Guide and the family has one, suggest reading it too —
  // it's the natural companion to a Template or a Tool recommendation.
  if (outputType !== "guide" && framework.outputs.some((o) => o.productType === "guide")) {
    supporting.push({
      frameworkSlug: framework.slug,
      outputType: "guide",
      reason: `Read the ${framework.name} guide first if you want the reasoning behind the method.`,
    });
  }

  // The framework's own recommended next-step family, if any and if there's still room.
  if (supporting.length < 2 && framework.nextStepFrameworkSlug) {
    const nextFramework = frameworks.find((f) => f.slug === framework.nextStepFrameworkSlug);
    if (nextFramework) {
      supporting.push({
        frameworkSlug: nextFramework.slug,
        outputType: resolveAvailableOutputType(nextFramework, "guide"),
        reason: `Once you're done, ${nextFramework.name} is the natural next step.`,
      });
    }
  }

  return {
    primary,
    supporting: supporting.slice(0, 2),
    isFreeStart: isOutputFree(framework, outputType),
  };
}

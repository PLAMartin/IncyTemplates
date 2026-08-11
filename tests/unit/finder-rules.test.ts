import { describe, expect, it } from "vitest";
import { outcomeForFrameworkSlug, resolveNextStep } from "@/lib/finder/rules";
import type { FinderFrameworkOption, FinderInput, Outcome } from "@/lib/finder/schema";

function framework(
  slug: string,
  overrides: Partial<FinderFrameworkOption> = {},
): FinderFrameworkOption {
  return {
    id: `id-${slug}`,
    slug,
    name: slug,
    outcomeStatement: `Outcome statement for ${slug}.`,
    nextStepFrameworkSlug: null,
    outputs: [
      { productType: "guide", accessType: "free" },
      { productType: "template", accessType: "free" },
      { productType: "tool", accessType: "free" },
    ],
    ...overrides,
  };
}

/**
 * Mirrors the real ten-family chain and its next-step links. Product Idea Generator sits at
 * the *front* of the chain (its own next step is Product Idea Assessor) rather than being
 * appended after the previously-terminal family — see docs/decisions/0029. Business Model
 * Chooser is a second, independent branch that also points at Pricing Your Product — a
 * "next step" link is many-to-one, not exclusive, the same way Launch already serves both
 * First Customers Planner and Pricing Your Product as a journey stage — see docs/decisions/0030.
 */
const ALL_FRAMEWORKS: FinderFrameworkOption[] = [
  framework("product-idea-generator", { nextStepFrameworkSlug: "product-idea-assessor" }),
  framework("product-idea-assessor", { nextStepFrameworkSlug: "customer-discovery-kit" }),
  framework("customer-discovery-kit", { nextStepFrameworkSlug: "better-decision-maker" }),
  framework("better-decision-maker", { nextStepFrameworkSlug: "mvp-scoper" }),
  framework("mvp-scoper", { nextStepFrameworkSlug: "product-naming-system" }),
  framework("product-naming-system", { nextStepFrameworkSlug: "first-customers-planner" }),
  framework("first-customers-planner", { nextStepFrameworkSlug: "product-market-fit-tracker" }),
  framework("product-market-fit-tracker", { nextStepFrameworkSlug: "pricing-your-product" }),
  framework("pricing-your-product", { nextStepFrameworkSlug: null }),
  framework("business-model-chooser", { nextStepFrameworkSlug: "pricing-your-product" }),
  framework("decision-framework-picker", { nextStepFrameworkSlug: null }),
  framework("product-positioning-builder", { nextStepFrameworkSlug: "product-naming-system" }),
  framework("customer-demand-test", { nextStepFrameworkSlug: "better-decision-maker" }),
  framework("product-prioritisation-tool", { nextStepFrameworkSlug: null }),
];

const baseInput = (overrides: Partial<FinderInput> = {}): FinderInput => ({
  outcome: "assess_idea",
  progress: "some_thinking_or_evidence",
  outputPreference: "no_preference",
  ...overrides,
});

describe("resolveNextStep — outcome maps to the right framework", () => {
  it.each([
    ["assess_idea", "product-idea-assessor"],
    ["gather_evidence", "customer-discovery-kit"],
    ["make_a_decision", "better-decision-maker"],
    ["scope_the_build", "mvp-scoper"],
    ["choose_a_name", "product-naming-system"],
    ["find_customers", "first-customers-planner"],
    ["check_fit", "product-market-fit-tracker"],
    ["choose_pricing", "pricing-your-product"],
    ["generate_ideas", "product-idea-generator"],
    ["choose_business_model", "business-model-chooser"],
    ["pick_a_decision_framework", "decision-framework-picker"],
    ["build_positioning", "product-positioning-builder"],
    ["test_demand", "customer-demand-test"],
    ["prioritise_tasks", "product-prioritisation-tool"],
  ] as [Outcome, string][])("%s -> %s", (outcome, expectedSlug) => {
    const result = resolveNextStep(baseInput({ outcome }), ALL_FRAMEWORKS);
    expect(result?.primary.frameworkSlug).toBe(expectedSlug);
  });
});

describe("resolveNextStep — progress infers an output type unless overridden", () => {
  it.each([
    ["nothing_yet", "guide"],
    ["some_thinking_or_evidence", "template"],
    ["clear_decision_or_scope", "tool"],
  ] as const)("progress=%s -> outputType=%s when no preference is given", (progress, expectedType) => {
    const result = resolveNextStep(baseInput({ progress, outputPreference: "no_preference" }), ALL_FRAMEWORKS);
    expect(result?.primary.outputType).toBe(expectedType);
  });

  it("an explicit output preference overrides the progress-based guess", () => {
    // progress alone would suggest "tool", but the preference should win.
    const result = resolveNextStep(
      baseInput({ progress: "clear_decision_or_scope", outputPreference: "learn" }),
      ALL_FRAMEWORKS,
    );
    expect(result?.primary.outputType).toBe("guide");
  });
});

describe("resolveNextStep — the 'not sure' outcome falls back sensibly", () => {
  it("resolves to Product Idea Assessor when it's available", () => {
    const result = resolveNextStep(baseInput({ outcome: "not_sure" }), ALL_FRAMEWORKS);
    expect(result?.primary.frameworkSlug).toBe("product-idea-assessor");
  });

  it("falls back to whatever's first when Product Idea Assessor isn't available", () => {
    const withoutPia = ALL_FRAMEWORKS.filter((f) => f.slug !== "product-idea-assessor");
    const result = resolveNextStep(baseInput({ outcome: "not_sure" }), withoutPia);
    expect(result?.primary.frameworkSlug).toBe(withoutPia[0]!.slug);
  });

  it("falls back the same way when the mapped framework for a real outcome isn't available", () => {
    const withoutTarget = ALL_FRAMEWORKS.filter((f) => f.slug !== "mvp-scoper");
    const result = resolveNextStep(baseInput({ outcome: "scope_the_build" }), withoutTarget);
    expect(result?.primary.frameworkSlug).toBe("product-idea-assessor");
  });

  it("returns null when no frameworks are available at all", () => {
    const result = resolveNextStep(baseInput(), []);
    expect(result).toBeNull();
  });
});

describe("resolveNextStep — falls back to an available output type", () => {
  it("falls back from tool to template when a framework has no Tool yet", () => {
    const frameworks = [
      framework("product-idea-assessor", {
        outputs: [
          { productType: "guide", accessType: "free" },
          { productType: "template", accessType: "free" },
        ],
      }),
    ];
    const result = resolveNextStep(baseInput({ outputPreference: "interactive_result" }), frameworks);
    expect(result?.primary.outputType).toBe("template");
  });
});

describe("resolveNextStep — supporting recommendations", () => {
  it("suggests the Guide as supporting content when the primary recommendation isn't the Guide", () => {
    const result = resolveNextStep(baseInput({ outputPreference: "interactive_result" }), ALL_FRAMEWORKS);
    expect(result?.primary.outputType).toBe("tool");
    expect(result?.supporting.some((s) => s.frameworkSlug === "product-idea-assessor" && s.outputType === "guide")).toBe(true);
  });

  it("does not suggest the Guide again when the primary recommendation already is the Guide", () => {
    const result = resolveNextStep(baseInput({ outputPreference: "learn" }), ALL_FRAMEWORKS);
    expect(result?.primary.outputType).toBe("guide");
    expect(result?.supporting.some((s) => s.frameworkSlug === "product-idea-assessor")).toBe(false);
  });

  it("includes the framework's own next-step family", () => {
    const result = resolveNextStep(baseInput({ outcome: "assess_idea", outputPreference: "learn" }), ALL_FRAMEWORKS);
    expect(result?.supporting.some((s) => s.frameworkSlug === "customer-discovery-kit")).toBe(true);
  });

  it("a family with a next step (First Customers Planner) includes it as a supporting recommendation", () => {
    const result = resolveNextStep(
      baseInput({ outcome: "find_customers", outputPreference: "interactive_result" }),
      ALL_FRAMEWORKS,
    );
    expect(result?.primary.frameworkSlug).toBe("first-customers-planner");
    expect(result?.supporting.some((s) => s.frameworkSlug === "product-market-fit-tracker")).toBe(true);
  });

  it("never returns more than two supporting recommendations", () => {
    const result = resolveNextStep(baseInput({ outcome: "assess_idea", outputPreference: "interactive_result" }), ALL_FRAMEWORKS);
    expect(result?.supporting.length).toBeLessThanOrEqual(2);
  });

  it("a family with a next step (Product/Market Fit Tracker) includes it as a supporting recommendation", () => {
    const result = resolveNextStep(
      baseInput({ outcome: "check_fit", outputPreference: "interactive_result" }),
      ALL_FRAMEWORKS,
    );
    expect(result?.primary.frameworkSlug).toBe("product-market-fit-tracker");
    expect(result?.supporting.some((s) => s.frameworkSlug === "pricing-your-product")).toBe(true);
  });

  it("a family with a next step (Product Idea Generator) includes it as a supporting recommendation", () => {
    const result = resolveNextStep(
      baseInput({ outcome: "generate_ideas", outputPreference: "interactive_result" }),
      ALL_FRAMEWORKS,
    );
    expect(result?.primary.frameworkSlug).toBe("product-idea-generator");
    expect(result?.supporting.some((s) => s.frameworkSlug === "product-idea-assessor")).toBe(true);
  });

  it("Business Model Chooser includes Pricing Your Product as a supporting recommendation, the same target Product/Market Fit Tracker also points at", () => {
    const result = resolveNextStep(
      baseInput({ outcome: "choose_business_model", outputPreference: "interactive_result" }),
      ALL_FRAMEWORKS,
    );
    expect(result?.primary.frameworkSlug).toBe("business-model-chooser");
    expect(result?.supporting.some((s) => s.frameworkSlug === "pricing-your-product")).toBe(true);
  });

  it("Decision Framework Picker has no next-step supporting recommendation — a second, independent terminal family, not the chain's tail", () => {
    const result = resolveNextStep(
      baseInput({ outcome: "pick_a_decision_framework", outputPreference: "interactive_result" }),
      ALL_FRAMEWORKS,
    );
    expect(result?.primary.frameworkSlug).toBe("decision-framework-picker");
    expect(result?.supporting).toHaveLength(1);
    expect(result?.supporting[0]?.outputType).toBe("guide");
  });

  it("Product Positioning Builder includes Product Naming System as a supporting recommendation, a second branch into that family alongside MVP Scoper", () => {
    const result = resolveNextStep(
      baseInput({ outcome: "build_positioning", outputPreference: "interactive_result" }),
      ALL_FRAMEWORKS,
    );
    expect(result?.primary.frameworkSlug).toBe("product-positioning-builder");
    expect(result?.supporting.some((s) => s.frameworkSlug === "product-naming-system")).toBe(true);
  });

  it("Customer Demand Test includes Better Decision Maker as a supporting recommendation, a second branch into that family alongside Customer Discovery Kit", () => {
    const result = resolveNextStep(
      baseInput({ outcome: "test_demand", outputPreference: "interactive_result" }),
      ALL_FRAMEWORKS,
    );
    expect(result?.primary.frameworkSlug).toBe("customer-demand-test");
    expect(result?.supporting.some((s) => s.frameworkSlug === "better-decision-maker")).toBe(true);
  });

  it("Product Prioritisation Tool has no next-step supporting recommendation — the last Tier 2 family, legitimately terminal", () => {
    const result = resolveNextStep(
      baseInput({ outcome: "prioritise_tasks", outputPreference: "interactive_result" }),
      ALL_FRAMEWORKS,
    );
    expect(result?.primary.frameworkSlug).toBe("product-prioritisation-tool");
    expect(result?.supporting).toHaveLength(1);
    expect(result?.supporting[0]?.outputType).toBe("guide");
  });

  it("the last family in the chain has no next-step supporting recommendation", () => {
    const result = resolveNextStep(
      baseInput({ outcome: "choose_pricing", outputPreference: "interactive_result" }),
      ALL_FRAMEWORKS,
    );
    expect(result?.primary.frameworkSlug).toBe("pricing-your-product");
    // Only the Guide suggestion should appear — there's no next family to recommend.
    expect(result?.supporting).toHaveLength(1);
    expect(result?.supporting[0]?.outputType).toBe("guide");
  });
});

describe("resolveNextStep — free-start reporting", () => {
  it("reports isFreeStart true when the recommended output is free", () => {
    const result = resolveNextStep(baseInput(), ALL_FRAMEWORKS);
    expect(result?.isFreeStart).toBe(true);
  });

  it("reports isFreeStart false when the recommended output is paid", () => {
    const paidFramework = [
      framework("product-idea-assessor", {
        outputs: [{ productType: "guide", accessType: "paid" }],
      }),
    ];
    const result = resolveNextStep(baseInput({ outputPreference: "learn" }), paidFramework);
    expect(result?.isFreeStart).toBe(false);
  });
});

describe("resolveNextStep — determinism", () => {
  it("the same input and catalogue always produce the same result", () => {
    const input = baseInput({ outcome: "gather_evidence", outputPreference: "no_preference" });
    expect(resolveNextStep(input, ALL_FRAMEWORKS)).toEqual(resolveNextStep(input, ALL_FRAMEWORKS));
  });
});

describe("outcomeForFrameworkSlug", () => {
  it("reverse-maps a known framework slug back to its outcome", () => {
    expect(outcomeForFrameworkSlug("mvp-scoper")).toBe("scope_the_build");
  });

  it("returns null for a slug with no outcome mapping", () => {
    expect(outcomeForFrameworkSlug("not-a-real-framework")).toBeNull();
  });
});
